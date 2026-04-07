import { motion } from 'framer-motion'
import { Timer, MessageSquare } from 'lucide-react'
import type { Order } from '../types'

interface OrderCardProps {
  order: Order;
  index: number;
  onReviewClick: (id: number) => void;
  getRemainingTimeStr: (seconds: number) => string;
}

export function OrderCard({ order, index, onReviewClick, getRemainingTimeStr }: OrderCardProps) {
  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.1 }}
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
            onClick={() => onReviewClick(order.id)}
            className="w-full glass-card bg-white/5 border-white/5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-white/70 flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
          >
            <MessageSquare size={14} /> Fikr bildirish
          </button>
       </div>
    </motion.div>
  )
}
