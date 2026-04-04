import os
import hashlib
import hmac
from urllib.parse import parse_qsl
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncio
from datetime import datetime, timedelta
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

load_dotenv()

app = FastAPI(title="Barakatoping API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with actual frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

def validate_telegram_data(init_data: str):
    """
    Validates the data received from the Telegram Web App.
    See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
    """
    if not BOT_TOKEN:
        # For development, if no token is provided, skip validation or return a warning
        return True

    try:
        vals = dict(parse_qsl(init_data))
        hash_val = vals.pop('hash', None)
        if not hash_val:
            return False

        data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(vals.items())])
        secret_key = hmac.new("WebAppData".encode(), BOT_TOKEN.encode(), hashlib.sha256).digest()
        hmac_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        return hmac_val == hash_val
    except Exception:
        return False

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Barakatoping API is running"}

from .database import get_db, engine
from . import models
from sqlalchemy.orm import Session

# Create tables if not exist (pre-caution)
models.Base.metadata.create_all(bind=engine)

from pydantic import BaseModel
from typing import Optional

class DishCreate(BaseModel):
    name: str
    original_price: float
    discount_price: float
    image_url: Optional[str] = "https://via.placeholder.com/150"

@app.get("/api/v1/buyer/dishes")
def get_dishes(lat: float = None, lng: float = None, db: Session = Depends(get_db)):
    user = db.query(models.User).first() # Demo user
    dishes = db.query(models.Dish).join(models.Restaurant).filter(models.Dish.status == 'active', models.Dish.quantity > 0).all()
    
    favorite_ids = [r.id for r in user.favorite_restaurants]
    
    result = []
    for dish in dishes:
        distance = None
        if lat is not None and lng is not None and dish.restaurant.latitude and dish.restaurant.longitude:
            # Simple distance calculation (demo purpose)
            from math import cos, asin, sqrt, pi
            lat1, lon1, lat2, lon2 = lat, lng, float(dish.restaurant.latitude), float(dish.restaurant.longitude)
            p = pi/180
            a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p) * cos(lat2*p) * (1-cos((lon2-lon1)*p))/2
            distance = 12742 * asin(sqrt(a)) # 2*R*asin...

        result.append({
            "id": dish.id,
            "restaurant_name": dish.restaurant.name,
            "name": dish.name,
            "original_price": dish.original_price,
            "discount_price": dish.discount_price,
            "pickup_start": str(dish.pickup_start) if dish.pickup_start else "20:30",
            "pickup_end": str(dish.pickup_end) if dish.pickup_end else "21:30",
            "image_url": dish.image_url,
            "quantity": dish.quantity,
            "is_favorite": dish.restaurant_id in favorite_ids,
            "distance_km": round(distance, 2) if distance is not None else None
        })
    return result

async def send_telegram_notification(chat_id: int, text: str):
    import httpx
    if not BOT_TOKEN: return
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={"chat_id": chat_id, "text": text})

# --- Bot Logic ---
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_cmd(message: types.Message):
    # Web App URL - Render yoki Ngrok manzilini ishlatamiz
    web_app_url = os.getenv("RENDER_EXTERNAL_URL") or "https://shadowed-adelyn-goosenecked.ngrok-free.dev"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🍱 Barakatopingni ochish", web_app=WebAppInfo(url=web_app_url))]
    ])
    
    await message.answer(
        "Assalomu alaykum! Barakatoping botiga xush kelibsiz. \n\n"
        "Biz bilan isrofga qarshi kurashing va mazali taomlarni arzon narxlarda harid qiling.",
        reply_markup=keyboard
    )
    with open("backend/bot.log", "a") as f:
        f.write(f"\n[LOG] {datetime.now()} - /start command received from user {message.from_user.id}")

async def run_bot():
    if not BOT_TOKEN:
        print(" [BOT ERROR] No BOT_TOKEN found. Bot will not start.")
        return

    print(" [BOT] Initializing Telegram Bot polling...")
    with open("backend/bot.log", "a") as f:
        f.write(f"\n[LOG] {datetime.now()} - Bot process initialized and starting polling...")
    
    while True:
        try:
            await dp.start_polling(bot)
        except Exception as e:
            print(f" [BOT ERROR] Polling failed: {e}. Retrying in 5s...")
            with open("backend/bot.log", "a") as f:
                f.write(f"\n[ERROR] {datetime.now()} - Polling failed: {e}")
            await asyncio.sleep(5)

from fastapi import FastAPI, Header, HTTPException, Depends, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
import shutil
import uuid

# Statik fayllarni (yuklangan rasmlarni) ko'rish uchun ulaymiz
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.post("/api/v1/seller/dishes")
async def create_dish(
    name: str = Form(...),
    original_price: float = Form(...),
    discount_price: float = Form(...),
    quantity: int = Form(1),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Rasmni saqlaymiz
    file_extension = image.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"backend/static/uploads/{file_name}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    
    # Baza uchun rasm manzili
    image_url = f"/api/static/uploads/{file_name}" # Proxy orqali ko'rinadi

    restaurant = db.query(models.Restaurant).first()
    if not restaurant:
        user = db.query(models.User).first()
        restaurant = models.Restaurant(owner_id=user.id, name="Mening Restoranim")
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
@app.post("/api/v1/orders")
def create_order(dish_id: int, quantity: int = 1, db: Session = Depends(get_db)):
    # 1. Taomni tekshiramiz
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Taom topilmadi")
    
    # 2. Soni borligini tekshiramiz
    if dish.quantity < quantity:
        raise HTTPException(status_code=400, detail=f"Uzr, hozirda faqat {dish.quantity} ta qolgan")
    
    # 3. Maxsus 6 xonali kod yaratamiz
    import random
    verification_code = f"{random.randint(100000, 999999)}"
    
    # 4. Bronni yaratamiz
    user = db.query(models.User).first() # Demo uchun birinchi user
    new_order = models.Order(
        buyer_id=user.id,
        dish_id=dish.id,
        quantity=quantity,
        verification_code=verification_code,
        status="pending"
    )
    db.add(new_order)
    
    # 5. Taom sonini kamaytiramiz
    dish.quantity -= quantity
    db.commit()
    
    return {
        "status": "success",
        "id": new_order.id,
        "verification_code": verification_code,
        "dish_name": dish.name,
        "pickup_end": str(dish.pickup_end) if dish.pickup_end else "21:30"
    }

@app.get("/api/v1/buyer/orders")
def get_my_orders(db: Session = Depends(get_db)):
    # Faqat 30 daqiqadan eski bo'lmagan va 'pending' holatidagi buyurtmalarni chiqaramiz
    from datetime import timezone
    now = datetime.now()
    orders = db.query(models.Order).filter(models.Order.status == 'pending').order_by(models.Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        # Qolgan vaqtni soniyalarda hisoblaymiz (30 min = 1800 sek)
        elapsed = (now - order.created_at).total_seconds()
        remaining = 1800 - elapsed
        
        if remaining > 0:
            result.append({
                "id": order.id,
                "dish_name": order.dish.name,
                "verification_code": order.verification_code,
                "status": order.status,
                "remaining_seconds": int(remaining),
                "created_at": order.created_at.isoformat()
            })
        else:
            # Muddati o'tganlarni api orqali o'chiramiz (statusni yangilaymiz)
            order.status = 'expired'
            db.commit()
            
    return result

async def cleanup_expired_orders():
    """Fondagi vazifa: har 5 daqiqada eski buyurtmalarni 'expired' deb belgilaydi."""
    while True:
        await asyncio.sleep(300) # 5 daqiqa
        db = next(get_db())
        try:
            expiry_limit = datetime.now() - timedelta(minutes=30)
            expired_orders = db.query(models.Order).filter(
                models.Order.status == 'pending',
                models.Order.created_at < expiry_limit
            ).all()
            
            for order in expired_orders:
                order.status = 'expired'
            db.commit()
            if expired_orders:
                print(f" [DB] {len(expired_orders)} ta eski buyurtma bekor qilindi.")
        except Exception as e:
            print(f" [DB ERROR] Cleanup task failed: {e}")
        finally:
            db.close()

@app.get("/api/v1/notifications")
def get_notifications(db: Session = Depends(get_db)):
    # Demo: return last 10 notifications
    notifications = db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(10).all()
    return notifications

async def keep_alive():
    """Render'da bot uxlab qolmasligi uchun har 10 daqiqada o'ziga o'zi ping yuboradi."""
    import httpx
    app_url = os.getenv("RENDER_EXTERNAL_URL") or "https://shadowed-adelyn-goosenecked.ngrok-free.dev"
    while True:
        await asyncio.sleep(600) # 10 daqiqa
        try:
            async with httpx.AsyncClient() as client:
                await client.get(f"{app_url}/health")
                print(" [PING] Keep-alive ping sent.")
        except Exception as e:
            print(f" [PING ERROR] Failed: {e}")

@app.get("/api/v1/seller/analytics")
def get_seller_analytics(db: Session = Depends(get_db)):
    from sqlalchemy import func
    # Demo analytics
    total_dishes = db.query(models.Dish).count()
    total_orders = db.query(models.Order).count()
    total_revenue = db.query(func.sum(models.Dish.discount_price)).join(models.Order).scalar() or 0
    
    return {
        "total_dishes": total_dishes,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "active_dishes": db.query(models.Dish).filter(models.Dish.status == 'active').count()
    }

@app.get("/api/v1/seller/dishes/all")
def get_seller_dishes(db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).first() # Demo
    if not restaurant: return []
    return db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).order_by(models.Dish.status == 'active', models.Dish.created_at.desc()).all()

class ReviewCreate(BaseModel):
    dish_id: int
    rating: int
    comment: Optional[str] = None

@app.post("/api/v1/reviews")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).first() # Demo user
    new_review = models.Review(
        user_id=user.id,
        dish_id=review.dish_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)
    db.commit()
    return {"status": "success", "message": "Raxmat! Sizning fikringiz biz uchun muhim."}

@app.get("/api/v1/favorites")
def get_favorites(db: Session = Depends(get_db)):
    user = db.query(models.User).first() # Demo user
    return user.favorite_restaurants

@app.post("/api/v1/favorites/{restaurant_id}")
def add_favorite(restaurant_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).first() # Demo user
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if restaurant not in user.favorite_restaurants:
        user.favorite_restaurants.append(restaurant)
        db.commit()
    return {"status": "success"}

@app.delete("/api/v1/favorites/{restaurant_id}")
def remove_favorite(restaurant_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).first() # Demo user
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if restaurant in user.favorite_restaurants:
        user.favorite_restaurants.remove(restaurant)
        db.commit()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    import threading

    def start_uvicorn():
        uvicorn.run(app, host="0.0.0.0", port=8000)

    # Bot va FastAPI'ni birga ishlatish uchun asyncio loopni boshqarish kerak
    # Ammo uvicorn o'zining loopini boshqaradi.
    # Eng oddiy yo'li - startup eventidan foydalanish
    
    @app.on_event("startup")
    async def startup_event():
        # Ma'lumotlarni seeding qilish (Initial data)
        db = next(get_db())
        try:
            user = db.query(models.User).first()
            if not user:
                user = models.User(username="demo_user", full_name="Demo Foydalanuvchi")
                db.add(user)
                db.commit()
                db.refresh(user)
                print(" [DB] Demo xaridor yaratildi.")

            restaurant = db.query(models.Restaurant).first()
            if not restaurant:
                new_restaurant = models.Restaurant(
                    owner_id=user.id, 
                    name="Fast Food Express", 
                    address="Toshkent sh., Amir Temur ko'chasi, 12-uy"
                )
                db.add(new_restaurant)
                db.commit()
                print(" [DB] Demo restoran yaratildi.")
        finally:
            db.close()

        # asyncio.create_task(run_bot()) # Botni alohida jarayonda ochishga qaror qildik
        asyncio.create_task(cleanup_expired_orders())
        asyncio.create_task(keep_alive())

    # Standalone bot entry point
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--bot":
         print(" [BOT] Standalone Bot process starting...")
         asyncio.run(run_bot())
         sys.exit(0)

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
