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
