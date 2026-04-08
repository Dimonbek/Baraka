from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid
import os
import shutil
from typing import Optional

from . import models, schemas, database, auth, config
from .database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/seller", tags=["seller"])

@router.post("/dishes")
async def create_dish(
    name: str = Form(...),
    category: str = Form("Milliy taomlar"),
    original_price: float = Form(...),
    discount_price: float = Form(...),
    quantity: int = Form(1),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
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
        category=category,
        original_price=original_price,
        discount_price=discount_price,
        image_url=image_url,
        quantity=quantity,
        status="active"
    )
    db.add(new_dish)
    db.commit()
    return {"status": "success", "message": "Taom muvaffaqiyatli qo'shildi!"}

@router.get("/analytics")
def get_seller_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
        if not restaurant: 
            return {"total_dishes": 0, "total_orders": 0, "total_revenue": 0.0, "active_dishes": 0}

        total_dishes = db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).count()
        total_orders = db.query(models.Order).join(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).count()
        
        rev_query = db.query(func.sum(models.Dish.discount_price)).join(models.Order).filter(models.Dish.restaurant_id == restaurant.id).scalar()
        total_revenue = float(rev_query) if rev_query is not None else 0.0
        
        return {
            "total_dishes": total_dishes,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "active_dishes": db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id, models.Dish.status == 'active').count()
        }
    except Exception as e:
        print(f" [DB ERROR] Analytics failed: {e}")
        return {"total_dishes": 0, "total_orders": 0, "total_revenue": 0.0, "active_dishes": 0}

@router.get("/profile")
def get_seller_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
        if not restaurant:
            return {"is_seller": False, "restaurant": None, "role": current_user.role}
        return {
            "is_seller": True,
            "role": current_user.role,
            "restaurant": {
                "id": restaurant.id,
                "name": restaurant.name,
                "address": restaurant.address,
                "status": restaurant.status
            }
        }
    except Exception as e:
        return {"is_seller": False, "error": str(e)}

@router.get("/orders")
def get_seller_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
        if not restaurant: return []
        
        orders = db.query(models.Order).join(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).order_by(models.Order.created_at.desc()).all()
        
        result = []
        from datetime import timezone, datetime
        now = datetime.now(timezone.utc)
        
        for order in orders:
            order_time = order.created_at
            if order_time.tzinfo is None:
                order_time = order_time.replace(tzinfo=timezone.utc)
            
            remaining = (order.pickup_time or 30) * 60 - (now - order_time).total_seconds()
            
            result.append({
                "id": order.id,
                "dish_name": order.dish.name,
                "quantity": order.quantity,
                "verification_code": order.verification_code,
                "status": order.status,
                "remaining_seconds": max(0, int(remaining)),
                "created_at": order.created_at.isoformat()
            })
        return result
    except Exception as e:
        print(f" [DB ERROR] Orders fetch failed: {e}")
        return []

@router.post("/orders/{order_id}/complete")
def complete_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order or not restaurant or order.dish.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
        
    order.status = "completed"
    db.commit()
    return {"status": "success"}

@router.get("/dishes/all")
def get_seller_dishes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        restaurant = db.query(models.Restaurant).filter(models.Restaurant.owner_id == current_user.id).first()
        if not restaurant: return []
        return db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant.id).order_by(models.Dish.status == 'active', models.Dish.created_at.desc()).all()
    except Exception as e:
        return []
