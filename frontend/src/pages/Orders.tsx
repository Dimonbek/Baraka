import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

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
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/buyer/orders`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // 1 soniya o'tganda soniyalarni kamaytiramiz
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

  return (
    <div className="py-6 px-4 pb-24">
      <h2 className="text-2xl font-black mb-8 leading-tight tracking-tight">Mening <span className="text-orange-500">Buyurtmalarim</span> 🛍️</h2>
      
      {loading ? (
        <div className="py-20 text-center text-tg-hint animate-pulse font-bold">Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-6xl mb-6 grayscale opacity-50">🛍️</div>
          <h2 className="text-xl font-bold mb-2">Siz hali hech narsa bron qilmadingiz</h2>
          <p className="text-tg-hint text-sm px-10 leading-relaxed">Hozir "Asosiy" sahifaga o'tib, o'zingizga yoqqan taomni arzon narxda oling!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group active:scale-[0.98] transition-transform">
               <div className={`absolute top-0 right-0 p-3 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'pending' ? 'bg-emerald-500 text-white' : 
                  order.status === 'expired' ? 'bg-white/10 text-tg-hint' : 'bg-tg-button text-white'
               }`}>
                  {order.status === 'pending' ? 'Banded' : 
                   order.status === 'expired' ? 'Muddati o\'tgan' : 'Yakunlandi'}
               </div>
              
              <div className="flex flex-col gap-4">
                 <div className="flex-1">
                    <div className="text-tg-hint text-[10px] font-bold uppercase mb-1">{new Date(order.created_at).toLocaleString()}</div>
                    <h3 className="text-lg font-black leading-tight mb-4 pr-16">{order.dish_name}</h3>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                       <div className="text-[10px] text-tg-hint uppercase font-bold mb-1 tracking-widest">Bron kodi (Xodimga ko'rsating)</div>
                       <div className="flex justify-center items-center gap-4">
                          <div className="text-3xl font-black text-tg-button tracking-widest">{order.verification_code}</div>
                          {order.status === 'pending' && (
                             <div className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-lg text-sm font-black animate-pulse">
                                {getRemainingTimeStr(order.remaining_seconds)}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
                  
                  <button 
                    onClick={() => {
                       const tg = (window as any).Telegram.WebApp;
                       if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
                       setReviewingOrderId(order.id);
                    }}
                    className="w-full bg-white/10 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-tg-hint active:scale-95 transition-transform"
                  >
                    Baholash va Fikr bildirish ⭐
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingOrderId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-6 z-[100] animate-in zoom-in-95 duration-300">
           <div className="bg-tg-bg border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
              <h2 className="text-2xl font-black mb-4">Taomga baho bering ⭐</h2>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                   <button 
                    key={star} 
                    onClick={() => {
                       const tg = (window as any).Telegram.WebApp;
                       if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
                       setRating(star);
                    }}
                    className={`text-3xl ${rating >= star ? 'grayscale-0' : 'grayscale opacity-50'}`}
                   >
                     ⭐
                   </button>
                ))}
              </div>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm mb-6 outline-none focus:border-tg-button min-h-[100px]"
                placeholder="Fikringizni yozing..."
              />
              <div className="flex gap-4">
                 <button 
                  onClick={() => { setReviewingOrderId(null); setRating(5); setComment(''); }} 
                  className="flex-1 bg-white/10 p-4 rounded-2xl font-bold"
                 >
                   Bekor qilish
                 </button>
                 <button 
                  onClick={async () => {
                    const resp = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                      body: JSON.stringify({ dish_id: orders.find(o => o.id === reviewingOrderId)?.id, rating, comment })
                    });
                    if (resp.ok) {
                      const tg = (window as any).Telegram.WebApp;
                      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
                      alert("Raxmat! Sizning fikringiz biz uchun muhim. ✅");
                      setReviewingOrderId(null); setRating(5); setComment('');
                    }
                  }} 
                  className="flex-[2] bg-tg-button text-white p-4 rounded-2xl font-black active:scale-95 transition-transform"
                 >
                   Yuborish
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default Orders
