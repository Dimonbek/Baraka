import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
      <div className="glass-card p-4 flex gap-4 items-start bg-white/5 border-white/5 group hover:bg-white/10 transition-colors">
         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div>
            <h3 className="text-sm font-bold mb-0.5">{title}</h3>
            <p className="text-[11px] text-tg-hint opacity-60 leading-relaxed font-medium">{desc}</p>
         </div>
      </div>
  )
}
