import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, DollarSign, Activity, Store, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import type { SellerProfile, Analytics, Dish } from '../types'
import { StatCard } from '../components/StatCard'
import { EmptyState } from '../components/EmptyState'
import { SellerRegistration } from '../components/SellerRegistration'
import { AddDishForm } from '../components/AddDishForm'
import { useTranslation } from '../i18n'

function Seller() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myDishes, setMyDishes] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

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
      const [analyticsData, dishesData, ordersData] = await Promise.all([
        api.get('/api/v1/seller/analytics'),
        api.get<any[]>('/api/v1/seller/dishes/all'),
        api.get<any[]>('/api/v1/seller/orders')
      ]);
      setAnalytics(analyticsData);
      setMyDishes(dishesData);
      setActiveOrders(ordersData);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await api.post(`/api/v1/seller/orders/${orderId}/complete`);
      toast.success("Buyurtma yakunlandi!");
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
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

  if (error) {
    return (
      <EmptyState 
        title="Ulanishda muammo"
        description="Profil ma'lumotlarini yuklab bo'lmadi. Iltimos, internetingizni tekshirib qayta urinib ko'ring."
        actionLabel="Qayta urinish"
        onAction={fetchProfile}
      />
    )
  }

  // --- Render Onboarding View if Not a Seller ---
  if (isSeller === false) {
    return <SellerRegistration onSuccess={fetchProfile} />
  }

  // --- Render Professional Seller Dashboard if Verified ---
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <header className="mb-10 flex items-center justify-between py-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bento-card flex items-center justify-center text-primary shadow-2xl">
               <Store size={32} />
            </div>
            <div>
               <h1 className="text-3xl font-black gradient-text tracking-tighter uppercase">{profile?.restaurant?.name}</h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                    {t('seller_panel')}
                  </p>
               </div>
            </div>
         </div>
         <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase shadow-inner">
            AKTIV
         </div>
      </header>
      
      {error ? (
        <div className="py-20 text-center flex flex-col items-center bento-card">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint/50 font-bold mb-6">Analitikani yuklab bo'lmadi</p>
           <button onClick={fetchDashboardData} className="glass-button text-xs py-3">{t('retry')}</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-10">
            <StatCard icon={<TrendingUp size={20}/>} label="Jami Sotuv" value={analytics?.total_orders || 0} color="text-primary" />
            <StatCard icon={<DollarSign size={20}/>} label="Daromad" value={`${(analytics?.total_revenue || 0).toLocaleString()} s.`} color="text-amber-400" />
            <StatCard icon={<Activity size={20}/>} label="Aktiv Taklif" value={analytics?.active_dishes || 0} color="text-emerald-400" />
            <StatCard icon={<Package size={20}/>} label="Jami Taom" value={analytics?.total_dishes || 0} color="text-primary" />
          </div>

          {/* Active Orders Section */}
          <h2 className="text-[10px] text-tg-hint font-black uppercase tracking-[0.3em] px-2 mb-6 flex items-center gap-3">
             <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_12px_#10b981]" /> 
             {t('active_orders')}
          </h2>
          <div className="grid gap-4 mb-14">
            {activeOrders.filter(o => o.status === 'pending').length === 0 ? (
              <div className="py-12 text-center bento-card opacity-40 italic text-sm border-dashed">{t('no_offers')}</div>
            ) : (
              activeOrders.filter(o => o.status === 'pending').map((order) => (
                <motion.div 
                   key={order.id}
                   layout
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bento-card p-6 border-primary/10 bg-primary/5 flex justify-between items-center group"
                >
                   <div>
                      <div className="text-[11px] text-primary font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Kod: {order.verification_code}
                      </div>
                      <h4 className="font-black text-lg leading-tight">{order.dish_name}</h4>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-tg-hint/60 font-bold uppercase tracking-widest">
                         <span>Soni: {order.quantity}</span>
                         <div className="w-1 h-1 rounded-full bg-white/10" />
                         <span>{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => handleCompleteOrder(order.id)}
                    className="bg-primary text-white p-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 active:scale-95 transition-all"
                   >
                     TAYYOR
                   </button>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {/* Forms & Inventory Section */}
      <div className="space-y-14">
        <AddDishForm onSuccess={fetchDashboardData} />

        <div className="space-y-6">
          <h2 className="text-[10px] text-tg-hint font-black uppercase tracking-[0.3em] px-2 flex items-center gap-3">
             <div className="w-1.5 h-4 bg-white/10 rounded-full" /> {t('my_dishes')}
          </h2>
          <div className="grid gap-3">
            {myDishes.length === 0 ? (
              <EmptyState 
                title="Hali taom yo'q"
                description="Siz hali birorta ham chegirmali taklif qo'shmagansiz. Yuqoridagi formadan boshlang!"
                icon="🥡"
              />
            ) : (
              myDishes.map((dish, i) => (
                <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   key={dish.id} 
                   className="bento-card p-5 flex gap-5 items-center group hover:bg-white/[0.04] transition-all"
                >
                   <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                      <img src={dish.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
                   </div>
                   <div className="flex-1">
                      <div className="font-black text-base group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{dish.name}</div>
                      <div className="text-[10px] text-tg-hint/60 font-black uppercase tracking-widest mt-1.5">
                        {dish.discount_price.toLocaleString()} s. • {dish.quantity} ta qoldi
                      </div>
                   </div>
                   <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                      /* @ts-ignore */
                      dish.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                   }`}>
                      {/* @ts-ignore */}
                      {dish.status}
                   </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Seller
