from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Table, Time, TIMESTAMP, DECIMAL, Text
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=False)
    full_name = Column(String(255))
    phone_number = Column(String(20))
    role = Column(String(50), default='buyer')
    status = Column(String(50), default='active')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    restaurants = relationship("Restaurant", back_populates="owner")
    orders = relationship("Order", back_populates="buyer")
    favorite_restaurants = relationship("Restaurant", secondary="favorites", back_populates="favorited_by")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    address = Column(Text)
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    status = Column(String(50), default='pending')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="restaurants")
    dishes = relationship("Dish", back_populates="restaurant")
    favorited_by = relationship("User", secondary="favorites", back_populates="favorite_restaurants")

class Dish(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    image_url = Column(Text)
    quantity = Column(Integer, default=0)
    original_price = Column(DECIMAL(10, 2))
    discount_price = Column(DECIMAL(10, 2))
    pickup_start = Column(Time)
    pickup_end = Column(Time)
    status = Column(String(50), default='active')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="dishes")
    orders = relationship("Order", back_populates="dish")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    quantity = Column(Integer, default=1)
    pickup_time = Column(Integer, default=30) # Default 30 minutes
    verification_code = Column(String(10), unique=True)
    status = Column(String(50), default='pending')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    buyer = relationship("User", back_populates="orders")
    dish = relationship("Dish", back_populates="orders")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dish_id = Column(Integer, ForeignKey("dishes.id"))
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User")
    dish = relationship("Dish")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    message = Column(Text)
    is_read = Column(Integer, default=0) # 0 = unread, 1 = read
    type = Column(String(50)) # e.g., 'order_status', 'new_offer'
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User")

# Association Table for Favorites
favorites = Table(
    "favorites",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("restaurant_id", Integer, ForeignKey("restaurants.id"), primary_key=True)
)
