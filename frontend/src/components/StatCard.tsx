import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="glass-card p-5 border-white/5 bg-white/5 relative overflow-hidden group hover:shadow-2xl hover:shadow-black/20 transition-all">
       <div className={`absolute -top-1 -right-1 opacity-5 group-hover:opacity-20 transition-opacity ${color} scale-150`}>
          {icon}
       </div>
       <div className="text-[10px] text-tg-hint uppercase font-black tracking-wider mb-2 opacity-50">{label}</div>
       <div className={`text-xl font-black ${color} tracking-tight`}>{value}</div>
    </div>
  )
}
