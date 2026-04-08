import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Activity, Package } from 'lucide-react'

interface SellerStatsProps {
  analytics: {
    total_orders: number;
    total_revenue: number;
    active_dishes: number;
    total_dishes: number;
  } | null;
}

export function SellerStats({ analytics }: SellerStatsProps) {
  const stats = [
    {
      label: 'Sotuvlar',
      value: analytics?.total_orders || 0,
      icon: <TrendingUp size={24} />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      span: 'col-span-1'
    },
    {
      label: 'Daromad',
      value: `${(analytics?.total_revenue || 0).toLocaleString()} s.`,
      icon: <DollarSign size={24} />,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      span: 'col-span-1'
    },
    {
      label: 'Aktiv Takliflar',
      value: analytics?.active_dishes || 0,
      icon: <Activity size={24} />,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      span: 'col-span-1'
    },
    {
      label: 'Jami Taomlar',
      value: analytics?.total_dishes || 0,
      icon: <Package size={24} />,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      span: 'col-span-1'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`bento-stat ${stat.span} group`}
        >
          <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
            {stat.icon}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{stat.label}</div>
            <div className="text-2xl font-black gradient-text tracking-tighter">{stat.value}</div>
          </div>
          
          {/* Subtle background decoration */}
          <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 scale-150`}>
            {stat.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
