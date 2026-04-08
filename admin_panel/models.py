# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .config import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Partner(Base):
    __tablename__ = "partners"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255))
    location = Column(String(255))  # could be lat,lng or city name
    created_at = Column(DateTime, default=datetime.utcnow)
    offers = relationship("Offer", back_populates="partner")

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=False)
    name = Column(String(255), nullable=False)
    original_price = Column(Float, nullable=False)
    discount_percent = Column(Float, default=0.0)  # current discount
    expiry = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    saved_kg = Column(Float, default=0.0)   # amount saved by "Isrof Stop"
    saved_units = Column(Integer, default=0)  # units saved
    image_url = Column(String(512))  # optional image for moderation
    created_at = Column(DateTime, default=datetime.utcnow)
    partner = relationship("Partner", back_populates="offers")
