import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, Minus, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import type { Dish } from '../types'
import { DishCard } from '../components/DishCard'
import { useTranslation } from '../i18n'

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [bookingStatus, setBookingStatus] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('Hammasi');

  const categories = [
    { name: 'Hammasi', labelId: 'all', icon: '🍽️' },
    { name: 'Milliy taomlar', labelId: 'national', icon: '🍛' },
    { name: 'Fast-fud', labelId: 'fastfood', icon: '🍔' },
    { name: 'Shirinliklar', labelId: 'desserts', icon: '🧁' },
    { name: 'Salatlar', labelId: 'salads', icon: '🥗' }
  ];

  useEffect(() => {
    const savedLat = localStorage.getItem('user_lat');
    const savedLng = localStorage.getItem('user_lng');
    if (savedLat && savedLng) {
      setUserLocation({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        localStorage.setItem('user_lat', latitude.toString());
        localStorage.setItem('user_lng', longitude.toString());
      }, (err) => console.warn(err));
    }
  }, []);

  const loadDishes = async () => {
    setLoading(true);
    setError(false);
    try {
      let path = '/api/v1/buyer/dishes';
      if (userLocation) path += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
      const data = await api.get<Dish[]>(path);
      setDishes(data);
    } catch (err) {
      setError(true);
      // Removed redundant toast to prevent spamming
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDishes(); }, [userLocation]);

  const handleBook = async (dishId: number) => {
    const tg = (window as any).Telegram.WebApp;
    try {
      const data = await api.post(`/api/v1/orders?dish_id=${dishId}&quantity=${orderQuantity}&pickup_time=${pickupTime}`);
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      setBookingStatus(data);
      toast.success("Muvaffaqiyatli bron qilindi!");
    } catch (err: any) {
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
      toast.error(err.message || "Bron qilishda xatolik!");
    }
  };

  const toggleFavorite = async (dish: Dish, e: React.MouseEvent) => {
    e.stopPropagation();
    const tg = (window as any).Telegram.WebApp;
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

    try {
      if (dish.is_favorite) {
        await api.delete(`/api/v1/favorites/${dish.restaurant_id}`);
        toast.success("Saralanganlardan olib tashlandi");
      } else {
        await api.post(`/api/v1/favorites/${dish.restaurant_id}`);
        toast.success("Saralanganlarga qo'shildi");
      }
      setDishes(prev => prev.map(d => 
        d.restaurant_id === dish.restaurant_id ? { ...d, is_favorite: !dish.is_favorite } : d
      ));
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      <header className="mb-8 flex justify-between items-center py-4">
        <div>
           <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent uppercase py-1">
             Baraka Toping
           </h1>
           <div className="flex items-center gap-2 mt-1">
             <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
             <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
               Baraka isrof qilingan joydan qochadi
             </p>
           </div>
        </div>
        <button 
          onClick={async () => {
            try {
              const data = await api.get<any[]>('/api/v1/notifications');
              setNotifications(data);
              setShowNotifications(true);
            } catch { /* Silent */ }
          }}
          className="relative glass-card w-14 h-14 flex items-center justify-center border-white/10 active:scale-95 shadow-2xl"
        >
          <Bell size={22} className="text-white/80" />
          {notifications.some(n => !n.is_read) && (
            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-primary rounded-full border-2 border-[#020617] shadow-sm animate-pulse" />
          )}
        </button>
      </header>

      {/* Categories Horizontal - Super Compact & Premium */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl whitespace-nowrap transition-all duration-500 border ${
              selectedCategory === cat.name
                ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-105 z-10 font-black'
                : 'bg-white/[0.02] text-tg-hint border-white/[0.05] font-bold opacity-60 hover:bg-white/[0.05]'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-[10px] uppercase tracking-widest leading-none">
              {/* @ts-ignore */}
              {t(cat.labelId as any)}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="py-20 text-center flex flex-col items-center">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint font-medium mb-6">{t('connection_error')}</p>
           <button onClick={loadDishes} className="glass-card px-6 py-2 text-sm font-bold border-white/10">{t('retry')}</button>
        </div>
      ) : loading ? (
        <div className="grid gap-4">
           {[1, 2, 3].map(i => <div key={i} className="h-28 glass-card animate-pulse" />)}
        </div>
      ) : dishes.filter(d => selectedCategory === 'Hammasi' || d.category === selectedCategory).length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-tg-hint font-medium italic opacity-50">{t('no_offers')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {dishes
            .filter(d => selectedCategory === 'Hammasi' || d.category === selectedCategory)
            .map((dish, i) => (
              <DishCard 
                key={dish.id} 
                dish={dish} 
                index={i} 
                onClick={setSelectedDish} 
                onToggleFavorite={toggleFavorite} 
              />
            ))}
        </div>
      )}

      {/* Models & Overlays */}
      <AnimatePresence>
        {selectedDish && !bookingStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/90 backdrop-blur-3xl flex items-end justify-center z-[60]"
            onClick={() => setSelectedDish(null)}
          >
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-[#020617] w-full max-w-sm rounded-t-[48px] p-10 pb-16 border-t border-white/5 relative shadow-2xl"
                onClick={e => e.stopPropagation()}
             >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-10 cursor-grab" onClick={() => setSelectedDish(null)} />
                
                <div className="relative h-64 rounded-[40px] overflow-hidden mb-10 group shadow-2xl">
                   <img src={selectedDish.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                   <div className="absolute bottom-6 left-6">
                      <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">{selectedDish.restaurant_name}</span>
                      <h2 className="text-3xl font-black gradient-text tracking-tighter uppercase">{selectedDish.name}</h2>
                   </div>
                </div>

                <div className="flex items-center justify-between mb-10">
                   <div className="flex flex-col">
                      <span className="text-tg-hint/30 line-through text-sm font-bold">{selectedDish.original_price.toLocaleString()} s.</span>
                      <span className="text-4xl font-black tracking-tighter">{selectedDish.discount_price.toLocaleString()} <span className="text-xs text-primary font-black uppercase">so'm</span></span>
                   </div>
                   <div className="flex items-center gap-6 bento-card p-2 px-4 rounded-3xl bg-white/[0.03]">
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 active:scale-90 hover:bg-white/10 transition-all"><Minus size={18}/></button>
                      <span className="text-2xl font-black w-6 text-center">{orderQuantity}</span>
                      <button onClick={() => setOrderQuantity(Math.min(selectedDish.quantity, orderQuantity + 1))} className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white active:scale-90 shadow-xl shadow-primary/30"><Plus size={18}/></button>
                   </div>
                </div>

                <div className="mb-10">
                   <div className="text-[10px] text-tg-hint/40 font-black uppercase tracking-[0.3em] mb-4 px-2">Kutish vaqti (daqiqa)</div>
                   <div className="grid grid-cols-4 gap-3">
                      {[15, 30, 45, 60].map(time => (
                         <button 
                            key={time}
                            onClick={() => setPickupTime(time)}
                            className={`py-4 rounded-2xl font-black text-xs transition-all duration-300 border ${
                               pickupTime === time 
                               ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-105' 
                               : 'bg-white/[0.02] text-tg-hint/40 border-white/[0.05] hover:bg-white/5'
                            }`}
                         >
                            {time}
                         </button>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => handleBook(selectedDish.id)}
                  className="w-full bg-primary py-6 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3 group"
                >
                   {t('book_now')}
                   <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
             </motion.div>
          </motion.div>
        )}

        {bookingStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-2xl flex items-center justify-center p-6 z-[70]"
          >
             <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
             >
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
                <CheckCircle2 size={72} className="text-emerald-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-2">Buyurtma qabul qilindi!</h2>
                <p className="text-tg-hint text-sm mb-4">Sizning tasdiqlash kodingiz:</p>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 ring-1 ring-white/10">
                   <span className="text-5xl font-black tracking-[0.2em] text-primary">
                     {bookingStatus.verification_code}
                   </span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8">
                  <p className="text-xs text-orange-400 font-bold leading-relaxed uppercase tracking-wide">
                    ⚠️ Diqqat: Ushbu bron faqat <span className="text-white">{pickupTime} daqiqa</span> davomida amal qiladi.
                  </p>
                </div>
                <button 
                  onClick={() => { setBookingStatus(null); setSelectedDish(null); navigate('/orders'); }} 
                  className="w-full bg-white text-slate-950 py-4 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Yopish
                </button>
             </motion.div>
          </motion.div>
        )}

        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] p-6 pt-16"
          >
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Xabarlar</h2>
                <button onClick={() => setShowNotifications(false)} className="w-10 h-10 glass-card flex items-center justify-center border-white/5"><X size={20}/></button>
             </div>
             <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] no-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-center text-tg-hint py-20 italic">Xabarlar yo'q</p>
                ) : (
                  notifications.map((n: any, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={n.id} 
                      className="glass-card p-4 border-white/5 ring-1 ring-white/10"
                    >
                       <p className="text-primary font-bold text-[10px] uppercase tracking-wider mb-1">{n.type}</p>
                       <h4 className="font-bold mb-1">{n.title}</h4>
                       <p className="text-xs text-tg-hint leading-relaxed">{n.message}</p>
                    </motion.div>
                  ))
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Home
