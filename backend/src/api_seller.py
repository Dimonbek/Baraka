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
        return {"total_dishes": 0, "total_orders": 0, "total_revenue": 0.0, "active_dishes": 0}

@router.get("/profile")
def get_seller_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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
