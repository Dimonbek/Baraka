import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bento-card p-6 flex flex-col justify-between group hover:shadow-primary/5 active:scale-95 transition-all duration-300 min-h-[120px]">
       <div className={`w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <div>
          <div className="text-[9px] text-tg-hint/40 uppercase font-black tracking-[0.2em] mb-1 leading-none">{label}</div>
          <div className={`text-2xl font-black ${color} tracking-tighter leading-none`}>{value}</div>
       </div>
       <div className={`absolute -bottom-2 -right-2 w-16 h-16 ${color} opacity-[0.03] blur-3xl`} />
    </div>
  )
}
