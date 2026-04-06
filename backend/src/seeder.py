from .database import get_db
from . import models

def seed_data():
    """Ma'lumotlarni seeding qilish (Initial data)"""
    db = next(get_db())
    try:
        user = db.query(models.User).first()
        if not user:
            # Full name is OK, but we need telegram_id. 12345678 as demo.
            user = models.User(telegram_id=12345678, full_name="Demo Foydalanuvchi")
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
    except Exception as e:
        print(f" [DB ERROR] Seeding failed: {e}")
    finally:
        db.close()
