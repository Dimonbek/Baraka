import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Stars, MapPin, Store, ArrowRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config'

interface FavoriteRestaurant {
  id: number;
  name: string;
  address: string;
}

function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/favorites`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="mb-10 flex items-center gap-4">
         <div className="w-14 h-14 glass-card flex items-center justify-center text-red-500 border-red-500/20 bg-red-500/5 shadow-2xl shadow-red-500/10">
            <Heart size={28} fill="currentColor" />
         </div>
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Saralanganlar</h1>
            <p className="text-tg-hint text-[11px] font-medium uppercase tracking-[0.1em] opacity-80 mt-1">
              Sevimli maskanlaringiz
            </p>
         </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
           {[1, 2, 3].map(i => <div key={i} className="h-20 glass-card animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="py-20 px-8 text-center glass-card border-white/5 relative overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
          <Stars size={64} className="mx-auto mb-6 text-white/10" />
          <h2 className="text-xl font-bold mb-3">Hali hech narsa yo'q</h2>
          <p className="text-tg-hint text-sm mb-10 leading-relaxed">
            Sevimli restoranlaringizni Asosiy bo'limdan yurakcha orqali qo'shishingiz mumkin.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-primary/20 group"
          >
            Ko'rish boshlash
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {favorites.map((res, i) => (
              <motion.div 
                key={res.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 flex items-center justify-between group border-white/5 ring-1 ring-white/10 active:bg-white/10"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center shadow-lg relative group-hover:ring-1 ring-primary/30 transition-all">
                     <Store size={24} className="text-primary/70" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{res.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-tg-hint text-xs">
                       <MapPin size={10} className="shrink-0" />
                       <span className="line-clamp-1">{res.address || "Manzil ko'rsatilmagan"}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
                   <Heart size={18} fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default Favorites
