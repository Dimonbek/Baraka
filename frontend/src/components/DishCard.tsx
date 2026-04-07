import { motion } from 'framer-motion';
import { MapPin, Heart } from 'lucide-react';
import type { Dish } from '../types';

interface DishCardProps {
  dish: Dish;
  index: number;
  onClick: (dish: Dish) => void;
  onToggleFavorite: (dish: Dish, e: React.MouseEvent) => void;
}

export function DishCard({ dish, index, onClick, onToggleFavorite }: DishCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(dish)}
      className="group glass-card p-3 flex gap-4 border-white/5 active:bg-white/10 relative overflow-hidden cursor-pointer"
    >
      <div className="relative w-24 h-24 shrink-0">
        <img 
          src={dish.image_url} 
          className="w-full h-full rounded-xl object-cover shadow-inner"
          onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Barakatoping'}
          alt={dish.name}
        />
        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1">
           <span className="text-[10px] font-bold text-emerald-400">-{Math.round((1 - dish.discount_price/dish.original_price)*100)}%</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <div>
               <span className="text-[10px] text-primary font-bold tracking-wide">{dish.restaurant_name}</span>
               <h3 className="text-[15px] font-bold mt-0.5 line-clamp-1">{dish.name}</h3>
            </div>
            <button 
               onClick={(e) => onToggleFavorite(dish, e)}
               className="p-1 hover:text-red-500 transition-colors"
            >
              <Heart size={18} className={dish.is_favorite ? "fill-red-500 text-red-500" : "text-white/30"} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
           <div className="flex flex-col">
              <span className="text-[10px] text-tg-hint line-through decoration-white/20">
                {dish.original_price.toLocaleString()}
              </span>
              <span className="text-lg font-black text-white leading-tight">
                {dish.discount_price.toLocaleString()} <span className="text-[10px] opacity-70">s.</span>
              </span>
           </div>
           <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1 text-[9px] text-tg-hint font-medium">
                <MapPin size={8} /> {dish.distance_km ? `${dish.distance_km} km` : 'Yaqinda'}
              </div>
              <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">
                 {dish.quantity} ta qoldi
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
