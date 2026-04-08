import json
from urllib.parse import parse_qs
from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from . import models

def get_current_user(
    x_telegram_init_data: str = Header(default=None),
    db: Session = Depends(get_db)
):
    """
    Parses Telegram WebApp initData to find the authenticated user.
    Falls back to the demo user for development or if testing in browser.
    """
    user = None
    if x_telegram_init_data:
        try:
            parsed = parse_qs(x_telegram_init_data)
            if "user" in parsed:
                user_data = json.loads(parsed["user"][0])
                telegram_id = user_data.get("id")
                if telegram_id:
                    user = db.query(models.User).filter(models.User.telegram_id == telegram_id).first()
        except Exception:
            pass

    # Fallback to local testing user
    if not user:
        user = db.query(models.User).filter(models.User.telegram_id == 12345678).first()
    
    if not user:
        user = db.query(models.User).first()
        
    if not user:
        raise HTTPException(status_code=401, detail="Foydalanuvchi aniqlanmadi.")
        
    return user
