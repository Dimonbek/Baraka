import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MapPin, Heart, Plus, Minus, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

interface Dish {
  id: number;
  restaurant_name: string;
  name: string;
  original_price: number;
  discount_price: number;
  pickup_start: string;
  pickup_end: string;
  image_url: string;
  quantity: number;
  restaurant_id: number;
  is_favorite: boolean;
  distance_km?: number;
}

function Home() {
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
      toast.error("Ma'lumotlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDishes(); }, [userLocation]);

  const handleBook = async (dishId: number) => {
    const tg = (window as any).Telegram.WebApp;
    try {
      const data = await api.post(`/api/v1/orders?dish_id=${dishId}&quantity=${orderQuantity}`);
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
      toast.error("Amalni bajarib bo'lmadi");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
    >
      <header className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
             Barakatoping
           </h1>
           <p className="text-tg-hint text-[11px] font-medium uppercase tracking-[0.1em] opacity-80 mt-1">
             Isrofga qarshi harakat
           </p>
        </div>
        <button 
          onClick={async () => {
            try {
              const data = await api.get<any[]>('/api/v1/notifications');
              setNotifications(data);
              setShowNotifications(true);
            } catch { toast.error("Xabarlarni yuklab bo'lmadi"); }
          }}
          className="relative glass-card w-12 h-12 flex items-center justify-center border-white/10 active:scale-95"
        >
          <Bell size={20} className="text-white/80" />
          {notifications.some(n => !n.is_read) && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full border-2 border-slate-900 shadow-sm animate-pulse" />
          )}
        </button>
      </header>

      {error ? (
        <div className="py-20 text-center flex flex-col items-center">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint font-medium mb-6">Server bilan ulanishda xatolik</p>
           <button onClick={loadDishes} className="glass-card px-6 py-2 text-sm font-bold border-white/10">Qayta urinish</button>
        </div>
      ) : loading ? (
        <div className="grid gap-4">
           {[1, 2, 3].map(i => <div key={i} className="h-28 glass-card animate-pulse" />)}
        </div>
      ) : dishes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-tg-hint font-medium">Hozircha hech qanday taklif yo'q</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {dishes.map((dish, i) => (
            <motion.div 
              key={dish.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDish(dish)}
              className="group glass-card p-3 flex gap-4 border-white/5 active:bg-white/10 relative overflow-hidden"
            >
              <div className="relative w-24 h-24 shrink-0">
                <img 
                  src={dish.image_url} 
                  className="w-full h-full rounded-xl object-cover shadow-inner"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Barakatoping'}
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
                       onClick={(e) => toggleFavorite(dish, e)}
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end justify-center z-[60] p-4"
            onClick={() => setSelectedDish(null)}
          >
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-slate-900 w-full max-w-sm rounded-[32px] p-8 pb-12 border border-white/10 relative shadow-2xl"
                onClick={e => e.stopPropagation()}
             >
                <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 cursor-grab" onClick={() => setSelectedDish(null)} />
                <div className="relative h-56 rounded-3xl overflow-hidden mb-6 group">
                   <img src={selectedDish.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                   <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDish.name}</h2>
                        <span className="text-primary text-sm font-medium">{selectedDish.restaurant_name}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                   <div className="flex flex-col">
                      <span className="text-tg-hint line-through text-sm">{selectedDish.original_price.toLocaleString()} so'm</span>
                      <span className="text-3xl font-black">{selectedDish.discount_price.toLocaleString()} so'm</span>
                   </div>
                   <div className="flex items-center gap-5 glass-card bg-white/5 border-white/5 p-2 rounded-2xl ring-1 ring-white/10">
                      <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 active:scale-90"><Minus size={16}/></button>
                      <span className="text-xl font-black w-4 text-center">{orderQuantity}</span>
                      <button onClick={() => setOrderQuantity(Math.min(selectedDish.quantity, orderQuantity + 1))} className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white active:scale-90 shadow-md shadow-primary/20"><Plus size={16}/></button>
                   </div>
                </div>

                <button 
                  onClick={() => handleBook(selectedDish.id)}
                  className="w-full bg-primary py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                   Bron qilish
                   <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                    ⚠️ Diqqat: Ushbu bron faqat 30 daqiqa davomida amal qiladi.
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
