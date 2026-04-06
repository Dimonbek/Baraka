import asyncio
from datetime import datetime, timedelta
import httpx
import os
from .database import get_db
from . import models
from .config import APP_URL

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

async def keep_alive():
    """Render'da bot uxlab qolmasligi uchun har 10 daqiqada o'ziga o'zi ping yuboradi."""
    while True:
        await asyncio.sleep(600) # 10 daqiqa
        try:
            async with httpx.AsyncClient() as client:
                await client.get(f"{APP_URL}/health")
                print(" [PING] Keep-alive ping sent.")
        except Exception as e:
            print(f" [PING ERROR] Failed: {e}")
