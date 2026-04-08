from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional

from . import models, schemas, database, auth
from .database import get_db
from .auth import get_current_user

router = APIRouter(prefix="/api/v1/buyer", tags=["buyer"])

@router.post("/orders")
def create_order(
    dish_id: int, 
    quantity: int = 1, 
    pickup_time: int = 30, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    dish = db.query(models.Dish).filter(models.Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Taom topilmadi")
    if dish.quantity < quantity:
        raise HTTPException(status_code=400, detail="Bunday miqdorda taom qolmagan")

    import random
    code = f"{random.randint(100000, 999999)}"
    
    new_order = models.Order(
        buyer_id=current_user.id,
        dish_id=dish.id,
        quantity=quantity,
        total_price=dish.discount_price * quantity,
        verification_code=code,
        status="pending"
    )
    
    # Decrease dish quantity
    dish.quantity -= quantity
    if dish.quantity <= 0:
        dish.status = "sold_out"
        
    db.add(new_order)
    db.commit()
    return {"status": "success", "verification_code": code, "order_id": new_order.id}

@router.get("/dishes")
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
            "restaurant_id": dish.restaurant_id,
            "restaurant_name": dish.restaurant.name,
            "name": dish.name,
            "category": dish.category,
            "original_price": dish.original_price,
            "discount_price": dish.discount_price,
            "image_url": dish.image_url,
            "quantity": dish.quantity,
            "is_favorite": dish.restaurant_id in favorite_ids,
            "distance_km": round(distance, 2) if distance is not None else None,
            "pickup_end": str(dish.pickup_end) if dish.pickup_end else "21:30"
        })
    return result

@router.get("/orders")
def get_my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    orders = db.query(models.Order).filter(models.Order.buyer_id == current_user.id).order_by(models.Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        order_time = order.created_at
        if order_time.tzinfo is None:
            order_time = order_time.replace(tzinfo=timezone.utc)
            
        elapsed = (now - order_time).total_seconds()
        max_duration = (order.pickup_time or 30) * 60
        remaining = max_duration - elapsed 
        
        current_status = order.status
        if remaining <= 0 and current_status == 'pending':
            current_status = 'expired'
            order.status = 'expired'
            db.commit()

        result.append({
            "id": order.id,
            "dish_id": order.dish_id,
            "dish_name": order.dish.name,
            "verification_code": order.verification_code if current_status == 'pending' else "---",
            "status": current_status,
            "remaining_seconds": max(0, int(remaining)),
            "created_at": order.created_at.isoformat()
        })
    return result
