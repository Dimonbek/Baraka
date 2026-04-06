from pydantic import BaseModel
from typing import Optional

class DishCreate(BaseModel):
    name: str
    original_price: float
    discount_price: float
    image_url: Optional[str] = "https://via.placeholder.com/150"

class ReviewCreate(BaseModel):
    dish_id: int
    rating: int
    comment: Optional[str] = None
