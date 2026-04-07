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
      className="group bento-card flex gap-4 active:scale-[0.98] transition-all duration-300 cursor-pointer"
    >
      <div className="relative w-28 h-28 shrink-0 rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src={dish.image_url} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Barakatoping'}
          alt={dish.name}
        />
        <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 shadow-2xl">
           <span className="text-[10px] font-black text-white">-{Math.round((1 - dish.discount_price/dish.original_price)*100)}%</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <div>
               <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-80">{dish.restaurant_name}</span>
               <h3 className="text-lg font-black mt-1 line-clamp-1 leading-tight">{dish.name}</h3>
            </div>
            <button 
               onClick={(e) => onToggleFavorite(dish, e)}
               className="p-1.5 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5"
            >
              <Heart size={18} className={dish.is_favorite ? "fill-red-500 text-red-500" : "text-white/20"} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
           <div className="flex flex-col">
              <span className="text-[11px] text-tg-hint/40 line-through font-bold">
                {dish.original_price.toLocaleString()}
              </span>
              <span className="text-xl font-black text-white leading-none">
                {dish.discount_price.toLocaleString()} <span className="text-[10px] text-primary/60 font-black">SO'M</span>
              </span>
           </div>
           <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-[10px] text-tg-hint font-black uppercase tracking-tighter opacity-70">
                <MapPin size={10} className="text-primary" /> {dish.distance_km ? `${dish.distance_km} km` : 'Yaqinda'}
              </div>
              <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20">
                 {dish.quantity} TA QOLDI
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
