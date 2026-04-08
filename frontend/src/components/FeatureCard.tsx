import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
      <div className="emerald-glass p-5 flex gap-5 items-start group hover:bg-emerald-500/[0.08] transition-all duration-500">
         <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all duration-500 shadow-inner">
            {icon}
         </div>
         <div className="flex flex-col gap-1.5">
            <h3 className="text-sm font-black uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none">{title}</h3>
            <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">{desc}</p>
         </div>
      </div>
  )
}
