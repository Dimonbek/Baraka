export interface Dish {
  id: number;
  restaurant_name: string;
  name: string;
  category: string;
  original_price: number;
  discount_price: number;
  pickup_start: string;
  pickup_end: string;
  image_url: string;
  quantity: number;
  restaurant_id: number;
  is_favorite: boolean;
  distance_km?: number;
  status?: string;
}

export interface Order {
  id: number;
  dish_id: number;
  dish_name: string;
  verification_code: string;
  status: string;
  remaining_seconds: number;
  created_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  thumbnail_url?: string;
  status?: string;
}

export interface SellerProfile {
  is_seller: boolean;
  restaurant: Restaurant | null;
}

export interface Analytics {
  total_dishes: number;
  total_orders: number;
  total_revenue: number;
  active_dishes: number;
}
