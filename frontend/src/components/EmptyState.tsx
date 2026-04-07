import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon = "🥣", actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-24 px-8 text-center bento-card border-white/5 relative overflow-hidden bg-white/[0.01] flex flex-col items-center">
       <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px]" />
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="text-6xl mb-8 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default"
       >
         {icon}
       </motion.div>
       <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter italic antialiased">{title}</h2>
       <p className="text-tg-hint text-xs mb-8 leading-relaxed italic opacity-50 px-4 max-w-[280px]">
         {description}
       </p>
       {actionLabel && onAction && (
         <button 
           onClick={onAction} 
           className="bg-white/5 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-xl shadow-black/20"
         >
           {actionLabel}
         </button>
       )}
    </div>
  );
}
