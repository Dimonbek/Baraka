import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Order } from '../types'

function Cart() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get<Order[]>('/api/v1/buyer/orders');
      setOrders(data);
    } catch (err: any) {
      console.warn("Buyurtmalarni yuklab bo'lmadi:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadOrders();
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => ({
        ...order,
        remaining_seconds: order.status === 'pending' ? Math.max(0, order.remaining_seconds - 1) : 0
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      <header className="mb-10 flex items-center gap-4">
         <div className="w-14 h-14 bento-card flex items-center justify-center text-primary bg-primary/5 border-primary/20 shadow-2xl">
            <ShoppingBag size={28} />
         </div>
         <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">Savat</h1>
            <p className="text-tg-hint text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">Sizning faol buyurtmalaringiz</p>
         </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
           {[1, 2].map(i => <div key={i} className="h-40 bento-card animate-pulse border-white/5 bg-white/[0.02]" />)}
        </div>
      ) : orders.length === 0 ? (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="py-24 px-8 text-center bento-card border-white/5 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
          <div className="text-7xl mb-8 opacity-20 filter grayscale">🛒</div>
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Savatingiz hozircha bo'sh</h2>
          <p className="text-tg-hint text-sm mb-12 leading-relaxed opacity-60 px-4 italic">Hech qanday taom tanlamadingiz. Mazali takliflarni topish uchun asosiy sahifaga o'ting!</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-primary/30"
          >
            Taom tanlashga o'tish
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode='popLayout'>
            {orders.map((order, i) => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.1 }}
                className={`bento-card p-6 border-white/5 bg-white/5 relative overflow-hidden ring-1 ${order.remaining_seconds < 300 && order.status === 'pending' ? 'ring-red-500/20' : 'ring-white/5'}`}
              >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-black text-xl tracking-tight uppercase italic text-white/90 mb-2">{order.dish_name}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 opacity-50'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${order.status === 'pending' ? 'text-emerald-400' : 'text-red-400 opacity-60'}`}>
                              {order.status === 'pending' ? 'Faol buyurtma' : 'Muddati yakunlangan'}
                          </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`py-1.5 px-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-black tracking-widest text-primary ${order.status === 'pending' ? 'opacity-100 scale-110 shadow-lg' : 'opacity-20 translate-x-4'}`}>
                          #{order.verification_code}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-tg-hint/40 italic">Tasdiqlash kodi</span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner transition-colors duration-500 ${order.remaining_seconds < 300 && order.status === 'pending' ? 'bg-red-500/5' : ''}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.remaining_seconds < 300 && order.status === 'pending' ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-tg-hint'}`}>
                           <Clock size={20} className={order.remaining_seconds < 300 && order.status === 'pending' ? "animate-spin-slow" : ""} />
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-[20px] font-black tracking-tighter ${order.remaining_seconds < 300 && order.status === 'pending' ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                              {formatTime(order.remaining_seconds)}
                           </span>
                           <span className="text-[9px] font-bold uppercase tracking-widest text-tg-hint/50 italic leading-none">Qolgan vaqt</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                       {order.status === 'pending' ? (
                         <div className="flex flex-col items-end">
                            <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Tayyor</span>
                            <CheckCircle2 size={16} className="text-emerald-500 mt-1 opacity-50" />
                         </div>
                       ) : (
                         <AlertTriangle size={24} className="text-red-500/30" />
                       )}
                    </div>
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-8 space-y-4">
                      <button 
                        onClick={async () => {
                          const feedback = prompt("Fikr-mulohazangizni yozing:");
                          if (feedback) {
                            try {
                               await api.post(`/api/v1/buyer/orders/${order.id}/feedback?feedback=${encodeURIComponent(feedback)}`);
                               const tg = (window as any).Telegram.WebApp;
                               if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
                               alert("Fikringiz yuborildi!");
                            } catch (e) {
                               alert("Xatolik yuz berdi");
                            }
                          }
                        }}
                        className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[11px] font-black uppercase tracking-[0.2em] italic active:scale-95"
                      >
                          Fikr bildirish
                      </button>
                      
                      <div className="text-center">
                        <p className="text-[10px] text-tg-hint/40 font-bold uppercase tracking-widest italic mb-2">
                          Buyurtmani bekor qilish uchun sotuvchi bilan bog'laning:
                        </p>
                        <a 
                          href={`tel:${order.seller_phone}`}
                          className="text-primary text-[11px] font-black uppercase tracking-widest hover:underline transition-all"
                        >
                          {order.seller_phone || "Sotuvchi raqami yo'q"}
                        </a>
                      </div>
                    </div>
                  )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default Cart
