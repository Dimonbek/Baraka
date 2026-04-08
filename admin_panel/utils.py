# utils.py
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Offer


def flash_sale(session: Session):
    """Increase discount to 60‑80% for offers expiring within 1 hour.
    Returns number of offers updated.
    """
    now = datetime.utcnow()
    threshold = now + timedelta(hours=1)
    offers = session.query(Offer).filter(
        Offer.is_active == True,
        Offer.expiry <= threshold,
        Offer.expiry > now
    ).all()
    count = 0
    for offer in offers:
        new_discount = random.randint(60, 80)
        if offer.discount_percent < new_discount:
            offer.discount_percent = new_discount
            count += 1
    session.commit()
    return count


def isrof_stop_stats(session: Session):
    """Aggregate saved kg and units for active offers today.
    Returns dict with total_kg and total_units.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    offers = session.query(Offer).filter(
        Offer.is_active == True,
        Offer.created_at >= today_start
    ).all()
    total_kg = sum(o.saved_kg for o in offers)
    total_units = sum(o.saved_units for o in offers)
    return {"total_kg": total_kg, "total_units": total_units}


def send_evening_push():
    """Placeholder for push notification.
    In production replace with Telegram Bot API, Firebase, etc.
    """
    print("[Push] Bugungi kechki chegirmalar boshlandi! (19:00)" )
    # Return True for success simulation
    return True
