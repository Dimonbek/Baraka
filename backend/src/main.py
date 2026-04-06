import os
import hashlib
import hmac
import asyncio
import shutil
import uuid
import json
from urllib.parse import parse_qsl
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Header, HTTPException, Depends, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .database import get_db, engine
from . import models, schemas, tasks, bot, seeder, config

# FastAPI app initialization
app = FastAPI(
    title="Barakatoping API", 
    description="Food Rescue Platform for Telegram Web Apps", 
    version="2.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://baraka-nu.vercel.app",
        "https://baraka-dlukps8g7-dilmurodnextday-4148s-projects.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "*"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-Telegram-Init-Data"],
)

# Global Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Logs for server console
    print(f" [SERVER ERROR] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Serverda kutilmagan xatolik yuz berdi. Iltimos keyinroq urinib ko'ring."}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail}
    )

# Static files for uploads
if not os.path.exists(config.STATIC_DIR): os.makedirs(config.STATIC_DIR)
if not os.path.exists(config.UPLOAD_DIR): os.makedirs(config.UPLOAD_DIR)
app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")

# Create tables if not exist
models.Base.metadata.create_all(bind=engine)

# --- Authentication Logic ---

def validate_telegram_data(init_data: str):
    """Validates the data received from the Telegram Web App."""
    if not config.BOT_TOKEN:
        return True # Dev mode fallback if no token

    try:
        vals = dict(parse_qsl(init_data))
        hash_val = vals.pop('hash', None)
        if not hash_val: return False

        data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(vals.items())])
        secret_key = hmac.new("WebAppData".encode(), config.BOT_TOKEN.encode(), hashlib.sha256).digest()
        hmac_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        return hmac_val == hash_val
    except Exception:
        return False

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Extracts and validates user from X-Telegram-Init-Data header."""
    init_data = request.headers.get("X-Telegram-Init-Data")
    
    if not init_data:
        if config.APP_ENV == "development": 
            return db.query(models.User).first() # Demo user for local dev without TG
        raise HTTPException(status_code=401, detail="Telegram orqali login qilish shart.")

    if not validate_telegram_data(init_data):
        raise HTTPException(status_code=401, detail="Telegram ma'lumotlari haqiqiy emas.")

    # Parse user info
    try:
        vals = dict(parse_qsl(init_data))
        user_json = vals.get("user")
        if not user_json: raise HTTPException(status_code=401, detail="Foydalanuvchi ma'lumotlari topilmadi.")
        
        user_data = json.loads(user_json)
        telegram_id = user_data.get("id")
        
        user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
        if not user:
            # Create new user on first visit
            full_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip() or "User"
            user = models.User(
                telegram_id=telegram_id,
                full_name=full_name,
                role="buyer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f" [DB] Yangi foydalanuvchi ro'yxatga olindi: {full_name} ({telegram_id})")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Ma'lumotlarni tahlil qilishda xato: {str(e)}")

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Barakatoping API is running"}

# --- Buyer Endpoints ---

@app.get("/api/v1/buyer/dishes")
def get_dishes(lat: float = None, lng: float = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dishes = db.query(models.Dish).join(models.Restaurant).filter(models.Dish.status == 'active', models.Dish.quantity > 0).all()
    favorite_ids = [r.id for r in current_user.favorite_restaurants]
    
    result = []
    for dish in dishes:
        distance = None
        if lat is not None and lng is not None and dish.restaurant.latitude and dish.restaurant.longitude:
            from math import cos, asin, sqrt, pi
            lat1, lon1, lat2, lon2 = lat, lng, float(dish.restaurant.latitude), float(dish.restaurant.longitude)
            p = pi/180
            a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p) * cos(lat2*p) * (1-cos((lon2-lon1)*p))/2
            distance = 12742 * asin(sqrt(a))

        result.append({
            "id": dish.id,
            "restaurant_name": dish.restaurant.name,
            "name": dish.name,
            "original_price": dish.original_price,
            "discount_price": dish.discount_price,
            "image_url": dish.image_url,
            "quantity": dish.quantity,
            "is_favorite": dish.restaurant_id in favorite_ids,
            "distance_km": round(distance, 2) if distance is not None else None,
            "pickup_end": str(dish.pickup_end) if dish.pickup_end else "21:30"
        })
    return result

@app.get("/api/v1/buyer/orders")
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from datetime import timezone
    now = datetime.now(timezone.utc)
    orders = db.query(models.Order).filter(models.Order.buyer_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        # created_at is aware because of timezone=True in models
        elapsed = (now - order.created_at).total_seconds()
        remaining = 1800 - elapsed # 30 min expiration window
        
        if remaining > 0 and order.status == 'pending':
            result.append({
                "id": order.id,
                "dish_name": order.dish.name,
                "verification_code": order.verification_code,
                "status": order.status,
                "remaining_seconds": int(remaining),
                "created_at": order.created_at.isoformat()
            })
        else:
            if order.status == 'pending':
                order.status = 'expired'
                db.add(order)
                db.commit()
            result.append({
                "id": order.id,
                "dish_name": order.dish.name,
                "verification_code": "---",
                "status": order.status,
                "remaining_seconds": 0,
                "created_at": order.created_at.isoformat()
            })
            
    return result

@app.get("/api/v1/favorites")
def get_favorites(current_user: models.User = Depends(get_current_user)):
    return current_user.favorite_restaurants

@app.post("/api/v1/favorites/{restaurant_id}")
def add_favorite(restaurant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant: raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if restaurant not in current_user.favorite_restaurants:
        current_user.favorite_restaurants.append(restaurant)
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return {"status": "success"}

@app.delete("/api/v1/favorites/{restaurant_id}")
def remove_favorite(restaurant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant: raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if restaurant in current_user.favorite_restaurants:
        current_user.favorite_restaurants.remove(restaurant)
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    return {"status": "success"}

# --- Seller Endpoints ---

@app.post("/api/v1/seller/dishes")
async def create_dish(
    name: str = Form(...),
    original_price: float = Form(...),
    discount_price: float = Form(...),
    quantity: int = Form(1),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Security: Only sellers/admins can add dishes (simplification: anyone is seller if current_user exists)
    # Rasm saqlash
    file_extension = image.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(config.UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    image_url = f"/api/static/uploads/{file_name}"

    restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
    if not restaurant:
        restaurant = models.Restaurant(owner_id=current_user.id, name=f"{current_user.full_name} Oshxonasi")
        db.add(restaurant)
        db.commit()
    
    new_dish = models.Dish(
        restaurant_id=restaurant.id,
        name=name,
        original_price=original_price,
        discount_price=discount_price,
        image_url=image_url,
        quantity=quantity,
        status="active"
    )
    db.add(new_dish)
    db.commit()
    return {"status": "success", "message": "Taom muvaffaqiyatli qo'shildi!"}

@app.get("/api/v1/seller/analytics")
def get_seller_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from sqlalchemy import func
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
    if not restaurant: return {"total_dishes": 0, "total_orders": 0, "total_revenue": 0, "active_dishes": 0}

    total_dishes = db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).count()
    total_orders = db.query(models.Order).join(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).count()
    total_revenue = db.query(func.sum(models.Dish.discount_price)).join(models.Order).filter(models.Dish.restaurant_id == restaurant.id).scalar() or 0
    
    return {
        "total_dishes": total_dishes,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "active_dishes": db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id, models.Dish.status == 'active').count()
    }

@app.get("/api/v1/seller/dishes/all")
def get_seller_dishes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
    if not restaurant: return []
    return db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).order_by(models.Dish.status == 'active', models.Dish.created_at.desc()).all()

# --- Common Endpoints ---

@app.post("/api/v1/orders")
def create_order(dish_id: int, quantity: int = 1, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not dish: raise HTTPException(status_code=404, detail="Taom topilmadi")
    if dish.quantity < quantity: raise HTTPException(status_code=400, detail="Zaxira yetarli emas")
    
    import random
    verification_code = f"{random.randint(100000, 999999)}"
    
    new_order = models.Order(
        buyer_id=current_user.id,
        dish_id=dish.id,
        quantity=quantity,
        verification_code=verification_code,
        status="pending"
    )
    db.add(new_order)
    dish.quantity -= quantity
    db.commit()
    
    return {
        "status": "success",
        "verification_code": verification_code,
        "dish_name": dish.name
    }

@app.post("/api/v1/reviews")
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_review = models.Review(
        user_id=current_user.id,
        dish_id=review.dish_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    return {"status": "success"}

@app.get("/api/v1/notifications")
def get_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).limit(10).all()

# --- Lifecycle ---

@app.on_event("startup")
async def startup_event():
    seeder.seed_data()
    
    # Globally set the bot's menu button to use the correct frontend URL
    try:
        from aiogram.types import MenuButtonWebApp, WebAppInfo
        await bot.bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(
                text="🍱 Barakatoping",
                web_app=WebAppInfo(url=bot.APP_URL)
            )
        )
        print(f" [BOT] Global Menu Button updated to: {bot.APP_URL}")
    except Exception as e:
        print(f" [BOT ERROR] Could not update menu button: {e}")

    asyncio.create_task(bot.run_bot())
    asyncio.create_task(tasks.cleanup_expired_orders())
    asyncio.create_task(tasks.keep_alive())

if __name__ == "__main__":
    import uvicorn
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--bot":
         asyncio.run(bot.run_bot())
         sys.exit(0)

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
