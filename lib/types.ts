// API <-> client o'rtasidagi umumiy DTO tiplari.

export const CATEGORIES = [
  { id: "all", name: "Hammasi", icon: "🍽️" },
  { id: "Milliy taomlar", name: "Milliy", icon: "🍛" },
  { id: "Fast-fud", name: "Fast-fud", icon: "🍔" },
  { id: "Shirinliklar", name: "Shirinliklar", icon: "🧁" },
  { id: "Salatlar", name: "Salatlar", icon: "🥗" },
] as const;

export interface DishDTO {
  id: number;
  name: string;
  category: string;
  restaurantId: number;
  restaurantName: string;
  imageUrl: string | null;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  pickupEnd: string | null;
  isFavorite: boolean;
  distanceKm: number | null;
}

export interface OrderDTO {
  id: number;
  dishId: number;
  dishName: string;
  dishImage: string | null;
  restaurantName: string;
  quantity: number;
  totalPrice: number;
  verificationCode: string;
  sellerPhone: string | null;
  status: "pending" | "completed" | "cancelled" | "expired";
  remainingSeconds: number;
  createdAt: string;
}

export interface ProfileDTO {
  id: number;
  telegramId: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: string;
  isSeller: boolean;
  restaurant: { id: number; name: string; status: string } | null;
}
