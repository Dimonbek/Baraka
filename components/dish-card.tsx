"use client";

import { Heart, MapPin, Clock, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import type { DishDTO } from "@/lib/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";

interface DishCardProps {
  dish: DishDTO;
  index?: number;
  onClick: (dish: DishDTO) => void;
  onToggleFavorite: (dish: DishDTO) => void;
}

export function DishCard({
  dish,
  index = 0,
  onClick,
  onToggleFavorite,
}: DishCardProps) {
  const percent = discountPercent(dish.originalPrice, dish.discountPrice);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => onClick(dish)}
      className="press card flex w-full gap-3 p-3 text-left"
    >
      {/* Rasm */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-app">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-faint">
            <UtensilsCrossed size={28} />
          </div>
        )}
        {percent > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{percent}%
          </span>
        )}
      </div>

      {/* Ma'lumot */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-brand-600">
              {dish.restaurantName}
            </p>
            <h3 className="truncate text-[15px] font-bold text-ink">
              {dish.name}
            </h3>
          </div>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dish);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                onToggleFavorite(dish);
              }
            }}
            className="press -m-1 flex h-8 w-8 items-center justify-center rounded-full"
          >
            <Heart
              size={19}
              className={cn(
                dish.isFavorite
                  ? "fill-accent-500 text-accent-500"
                  : "text-faint",
              )}
            />
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-faint line-through">
              {formatPrice(dish.originalPrice)}
            </span>
            <span className="text-[15px] font-extrabold text-ink">
              {formatPrice(dish.discountPrice)}{" "}
              <span className="text-[11px] font-semibold text-muted">so'm</span>
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-[11px] text-muted">
            {dish.distanceKm != null && (
              <span className="flex items-center gap-0.5">
                <MapPin size={12} /> {dish.distanceKm} km
              </span>
            )}
            {dish.pickupEnd && (
              <span className="flex items-center gap-0.5">
                <Clock size={12} /> {dish.pickupEnd} gacha
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
