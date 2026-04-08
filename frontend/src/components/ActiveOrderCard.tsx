import { motion } from 'framer-motion'
import { CheckCircle2, Clock, User, QrCode } from 'lucide-react'

interface ActiveOrderCardProps {
  order: {
    id: number;
    dish_name: string;
    quantity: number;
    verification_code: string;
    created_at: string;
    status: string;
  };
  onComplete: (id: number) => void;
}

export function ActiveOrderCard({ order, onComplete }: ActiveOrderCardProps) {
  const time = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="emerald-glass p-6 group flex flex-col gap-6 relative overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            Yangi Buyurtma
          </div>
          <h3 className="text-xl font-black gradient-text tracking-tighter uppercase leading-tight">
            {order.dish_name}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {time}</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="flex items-center gap-1.5"><User size={12} /> {order.quantity} ta</span>
          </div>
        </div>
        
        <div className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-white/50 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500">
           <QrCode size={28} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Tasdiqlash Kodi</span>
          <span className="text-lg font-black text-emerald-400 tracking-[0.2em]">{order.verification_code}</span>
        </div>
        
        <button
          onClick={() => onComplete(order.id)}
          className="bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all hover:shadow-emerald-500/40 hover:emerald-glow flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          Tayyor
        </button>
      </div>

      {/* Decorative background number */}
      <div className="absolute -left-4 -bottom-8 text-[120px] font-black text-white/[0.02] pointer-events-none select-none italic">
        #{order.id}
      </div>
    </motion.div>
  );
}
