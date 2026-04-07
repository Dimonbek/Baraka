import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, DollarSign, Activity, Store, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import type { SellerProfile, Analytics, Dish } from '../types'
import { StatCard } from '../components/StatCard'
import { SellerRegistration } from '../components/SellerRegistration'
import { AddDishForm } from '../components/AddDishForm'

function Seller() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [myDishes, setMyDishes] = useState<Dish[]>([]);

  const fetchProfile = async () => {
    try {
      const data = await api.get<SellerProfile>('/api/v1/seller/profile');
      setProfile(data);
      setIsSeller(data.is_seller);
      if (data.is_seller) {
        fetchDashboardData();
      }
    } catch (err) {
      setError(true);
    } finally {
      setFetching(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [analyticsData, dishesData] = await Promise.all([
        api.get<Analytics>('/api/v1/seller/analytics'),
        api.get<Dish[]>('/api/v1/seller/dishes/all')
      ]);
      setAnalytics(analyticsData);
      setMyDishes(dishesData);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (fetching) {
     return (
       <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-tg-hint text-sm font-medium animate-pulse">Tekshirilmoqda...</p>
       </div>
     )
  }

  // --- Render Onboarding View if Not a Seller ---
  if (!isSeller) {
    return <SellerRegistration onSuccess={fetchProfile} />
  }

  // --- Render Professional Seller Dashboard if Verified ---
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32"
    >
      <header className="mb-10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 glass-card flex items-center justify-center text-primary border-primary/20 bg-primary/5 shadow-inner">
               <Store size={28} />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-tight">{profile?.restaurant?.name}</h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-tg-hint text-[10px] font-bold uppercase tracking-widest opacity-80">
                    Sotuvchi Paneli
                  </p>
               </div>
            </div>
         </div>
         <div className="text-right">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase">
               AKTIV
            </div>
         </div>
      </header>
      
      {error ? (
        <div className="py-20 text-center flex flex-col items-center">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint font-medium mb-6">Analitikani yuklab bo'lmadi</p>
           <button onClick={fetchDashboardData} className="glass-card px-8 py-2 text-sm font-bold border-white/10">Yangilash</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-12">
          <StatCard icon={<TrendingUp size={16}/>} label="Jami Sotuv" value={analytics?.total_orders || 0} color="text-primary" />
          <StatCard icon={<DollarSign size={16}/>} label="Daromad" value={`${(analytics?.total_revenue || 0).toLocaleString()} s.`} color="text-orange-400" />
          <StatCard icon={<Activity size={16}/>} label="Aktiv Taklif" value={analytics?.active_dishes || 0} color="text-cyan-400" />
          <StatCard icon={<Package size={16}/>} label="Jami Taom" value={analytics?.total_dishes || 0} color="text-emerald-400" />
        </div>
      )}

      {/* Add New Dish Form Component */}
      <AddDishForm onSuccess={fetchDashboardData} />

      {/* Inventory */}
      <h2 className="text-[10px] text-tg-hint font-bold uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2">
         <div className="w-1 h-3 bg-white/20 rounded-full" /> Mening taomlarim
      </h2>
      <div className="grid gap-3">
        {myDishes.length === 0 ? (
          <div className="py-12 text-center glass-card border-white/5 opacity-50 italic text-sm">Hali takliflar yo'q</div>
        ) : (
          myDishes.map((dish, i) => (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               key={dish.id} 
               className="glass-card p-4 flex gap-4 items-center border-white/5 ring-1 ring-white/5 group hover:bg-white/5 hover:-translate-y-0.5 transition-all"
            >
               <img src={dish.image_url} className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/10 shadow-lg" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
               <div className="flex-1">
                  <div className="font-bold text-[15px] group-hover:text-primary transition-colors">{dish.name}</div>
                  <div className="text-[10px] text-tg-hint font-medium opacity-60 mt-1">
                    {dish.discount_price.toLocaleString()} s. • {dish.quantity} ta qoldi
                  </div>
               </div>
               <div className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full ring-1 ${
                  /* @ts-ignore - quick fix since status might not be in generic Dish type */
                  dish.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-red-500/10 text-red-500 ring-red-500/20'
               }`}>
                  {/* @ts-ignore */}
                  {dish.status}
               </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default Seller
