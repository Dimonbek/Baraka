import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import { toast } from 'react-hot-toast'
import { ShoppingBag, Timer, Star, MessageSquare, CheckCircle2, History, AlertCircle } from 'lucide-react'

interface Order {
  id: number;
  dish_name: string;
  verification_code: string;
  status: string;
  remaining_seconds: number;
  created_at: string;
}

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get<Order[]>('/api/v1/buyer/orders');
      setOrders(data);
    } catch (err) {
      setError(true);
      toast.error("Buyurtmalarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const timer = setInterval(() => {
       setOrders(prev => prev.map(o => ({ ...o, remaining_seconds: Math.max(0, o.remaining_seconds - 1) })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingTimeStr = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReviewSubmit = async () => {
    const dish_id = orders.find(o => o.id === reviewingOrderId)?.id;
    if (!dish_id) return;

    try {
      await api.post('/api/v1/reviews', { dish_id, rating, comment });
      const tg = (window as any).Telegram.WebApp;
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      toast.success("Raxmat! Fikringiz qabul qilindi.");
      setReviewingOrderId(null);
      setRating(5);
      setComment('');
    } catch (err: any) {
      toast.error(err.message || "Fikr yuborishda xatolik");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
    >
      <header className="mb-8 flex items-center gap-3">
         <div className="w-12 h-12 glass-card flex items-center justify-center text-primary border-primary/20 bg-primary/5">
            <ShoppingBag size={24} />
         </div>
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Savat</h2>
            <p className="text-tg-hint text-xs">Sizning faol buyurtmalaringiz</p>
         </div>
      </header>
      
      {error ? (
        <div className="py-20 text-center flex flex-col items-center">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint font-medium mb-6">Ma'lumotlarni yuklab bo'lmadi</p>
           <button onClick={loadOrders} className="glass-card px-8 py-2 text-sm font-bold border-white/10">Qayta yuklash</button>
        </div>
      ) : loading ? (
        <div className="grid gap-4">
           {[1, 2, 3].map(i => <div key={i} className="h-40 glass-card animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
             <History size={32} className="text-white/20" />
          </div>
          <h2 className="text-xl font-bold mb-2">Hali buyurtma yo'q</h2>
          <p className="text-tg-hint text-sm px-10 leading-relaxed">
            Asosiy sahifadan yoqtirgan taomingizni bron qiling!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order, i) => (
            <motion.div 
               key={order.id} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-card p-6 border-white/5 relative overflow-hidden group shadow-2xl"
            >
               <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'pending' ? 'bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/20' : 
                  'bg-white/5 text-tg-hint'
               }`}>
                  {order.status === 'pending' ? 'Faol' : 'Yakunlangan'}
               </div>
              
               <div className="flex flex-col gap-5">
                  <div>
                    <div className="text-[10px] text-tg-hint font-medium uppercase tracking-[0.15em] mb-1 opacity-60">
                       {new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <h3 className="text-lg font-bold pr-16 leading-tight">{order.dish_name}</h3>
                  </div>

                  <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 ring-1 ring-white/5">
                     <div className="text-[10px] text-primary/60 uppercase font-black mb-3 tracking-widest text-center">Tasdiqlash kodi</div>
                     <div className="flex justify-center items-center gap-6">
                        <div className="text-4xl font-black text-primary tracking-[0.1em]">{order.verification_code}</div>
                        {order.status === 'pending' && (
                           <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ring-1 ring-primary/20">
                              <Timer size={14} className="animate-pulse" />
                              {getRemainingTimeStr(order.remaining_seconds)}
                           </div>
                        )}
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => setReviewingOrderId(order.id)}
                    className="w-full glass-card bg-white/5 border-white/5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white/70 flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <MessageSquare size={14} /> Fikr bildirish
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingOrderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-slate-900 border border-white/10 rounded-[32px] p-8 w-full max-w-sm shadow-2xl overflow-hidden relative"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Qanday edi?</h2>
                <p className="text-tg-hint text-xs mb-8">Taom sifatini baholang</p>
                
                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setRating(star)}
                      className={`transition-all duration-300 ${rating >= star ? 'scale-110' : 'scale-90 opacity-30 grayscale'}`}
                    >
                      <Star size={32} className={rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-white'} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-5 text-sm mb-8 outline-none focus:ring-2 ring-primary/20 min-h-[120px] transition-all"
                  placeholder="Fikr-mulohazalaringiz..."
                />

                <div className="flex gap-4">
                   <button 
                    onClick={() => setReviewingOrderId(null)} 
                    className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-sm"
                   >
                     Yopish
                   </button>
                   <button 
                    onClick={handleReviewSubmit} 
                    className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     <CheckCircle2 size={16} /> Yuborish
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Orders
