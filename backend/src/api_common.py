from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, database, auth
from .database import get_db
from .auth import get_current_user

router = APIRouter(tags=["common"])

@router.get("/api/v1/health")
def health_check():
    return {"status": "ok", "message": "Uvol Bo'lmasin API is running"}

@router.get("/api/v1/profile")
def get_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "telegram_id": current_user.telegram_id
    }

@router.get("/api/v1/favorites")
def get_favorites(current_user: models.User = Depends(get_current_user)):
    return current_user.favorite_restaurants

@router.post("/api/v1/favorites/{restaurant_id}")
def add_favorite(restaurant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if restaurant not in current_user.favorite_restaurants:
        current_user.favorite_restaurants.append(restaurant)
        db.commit()
    return {"status": "success"}

@router.delete("/api/v1/favorites/{restaurant_id}")
def remove_favorite(restaurant_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    if restaurant in current_user.favorite_restaurants:
        current_user.favorite_restaurants.remove(restaurant)
        db.commit()
    return {"status": "success"}
