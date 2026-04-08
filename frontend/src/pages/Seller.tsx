import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Store, AlertCircle, ShoppingBag, LayoutGrid, Settings, History } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import type { SellerProfile } from '../types'
import { EmptyState } from '../components/EmptyState'
import { SellerRegistration } from '../components/SellerRegistration'
import { AddDishForm } from '../components/AddDishForm'
import { SellerStats } from '../components/SellerStats'
import { ActiveOrderCard } from '../components/ActiveOrderCard'
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

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
      const tg = (window as any).Telegram.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      toast.success("Buyurtma yakunlandi!");
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file, file.name);
      
      const toastId = toast.loading("Logotip yangilanmoqda...");
      await api.post('/api/v1/seller/restaurant/logo', formData);
      toast.success("Logotip muvaffaqiyatli yangilandi!", { id: toastId });
      
      fetchProfile(); // Refresh profile to get the new logo
    } catch (err: any) {
      toast.error(err.message || "Logotipni yuklashda xatolik yuz berdi");
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (fetching) {
     return (
       <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-white font-black uppercase tracking-widest text-xs">Yuklamoqda</p>
            <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-100, 100] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-full h-full bg-emerald-500" 
              />
            </div>
          </div>
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

  if (isSeller === false) {
    return <SellerRegistration onSuccess={fetchProfile} />
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      {/* Premium Header */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-5">
              <div className="w-20 h-20 emerald-glass p-1 shadow-2xl relative group">
                <input 
                  type="file" 
                  id="logoInput" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoChange} 
                />
                <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#020617] flex items-center justify-center">
                  <img src={profile?.restaurant?.thumbnail_url ? `${import.meta.env.VITE_API_URL || 'https://barakatoping-backend.onrender.com'}${profile.restaurant.thumbnail_url}` : 'https://placehold.co/150x150/020617/10b981?text=Logo'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt=" " />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-[3px] border-[#020617] rounded-full animate-pulse-emerald shadow-[0_0_10px_#10b981]" />
              </div>
              <div className="flex flex-col gap-0.5">
                 <h1 className="text-4xl font-black gradient-text tracking-tighter uppercase leading-none">{profile?.restaurant?.name}</h1>
                 <div className="flex items-center gap-2.5 mt-1.5 opacity-60">
                    <Store size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('seller_panel')}</span>
                 </div>
              </div>
           </div>
           
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => document.getElementById('logoInput')?.click()}
             className="w-12 h-12 glass-card flex items-center justify-center text-white/40 hover:text-emerald-400 hover:border-emerald-500/20 transition-all shadow-xl"
           >
              <Settings size={22} />
           </motion.button>
        </div>

        {/* Tab Switcher - Glass Style */}
        <div className="emerald-glass p-1.5 flex gap-2 mb-10 overflow-hidden relative">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <LayoutGrid size={16} /> Dashbord
          </button>
          <button 
             onClick={() => setActiveTab('history')}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <History size={16} /> Tarix
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
            <SellerStats analytics={analytics} />

            {/* Quick Action: Add Dish */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6 px-2">
                 <h2 className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full emerald-glow shadow-[0_0_12px_#34d399]" /> 
                    Amallar
                 </h2>
              </div>
              
              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`w-full p-8 emerald-glass border-dashed flex flex-col items-center justify-center gap-4 group transition-all duration-500 ${showAddForm ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20'}`}
              >
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${showAddForm ? 'bg-red-500/20 text-red-500 rotate-45' : 'bg-emerald-500 text-white emerald-glow scale-110 shadow-2xl'}`}>
                    <Plus size={32} />
                 </div>
                 <div className="text-center">
                    <span className="text-base font-black gradient-text tracking-tighter uppercase">
                       {showAddForm ? "Bekor Qilish" : "Yangi Taklif Qo'shish"}
                    </span>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                       {showAddForm ? "Formani yopish uchun bosing" : "Zaxiradagi mahsulotlarni soting"}
                    </p>
                 </div>
              </motion.button>

              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-8 px-2 pb-12">
                       <AddDishForm onSuccess={() => { fetchDashboardData(); setShowAddForm(false); }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Active Orders Horizontal Section */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h2 className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-1.5 h-4 bg-emerald-500 rounded-full" /> 
                     Aktiv Buyurtmalar
                  </h2>
                  <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/10">
                    {activeOrders.filter(o => o.status === 'pending').length} Ta
                  </div>
               </div>
               
               <div className="grid gap-4">
                  {activeOrders.filter(o => o.status === 'pending').length === 0 ? (
                    <div className="py-16 emerald-glass border-dashed opacity-50 flex flex-col items-center justify-center gap-4">
                       <ShoppingBag size={48} className="text-white/10" />
                       <p className="text-xs font-black uppercase tracking-widest text-white/30 italic">Hali buyurtmalar yo'q</p>
                    </div>
                  ) : (
                    activeOrders.filter(o => o.status === 'pending').map((order) => (
                      <ActiveOrderCard 
                        key={order.id} 
                        order={order} 
                        onComplete={handleCompleteOrder} 
                      />
                    ))
                  )}
               </div>
            </div>

            {/* My Inventory List */}
            <div className="space-y-6">
              <h2 className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] px-2 flex items-center gap-3">
                 <div className="w-1.5 h-4 bg-white/10 rounded-full" /> Mening Katalogim
              </h2>
              <div className="grid gap-3">
                {myDishes.length === 0 ? (
                  <div className="py-12 glass-card text-center text-white/30 text-xs italic">Katalog bo'sh</div>
                ) : (
                  myDishes.map((dish, i) => (
                    <motion.div 
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       key={dish.id} 
                       className="glass-card p-4 flex gap-5 items-center group hover:bg-white/[0.04] transition-all"
                    >
                       <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
                          <img src={dish.image_url} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt={dish.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div className="flex-1">
                          <div className="font-black text-sm group-hover:text-emerald-400 transition-colors tracking-tight uppercase leading-tight">{dish.name}</div>
                          <div className="text-[9px] text-white/40 font-black uppercase tracking-[0.1em] mt-1 flex gap-2 items-center">
                            <span className="text-emerald-400">{dish.discount_price.toLocaleString()} s.</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>{dish.quantity} ta mavjud</span>
                          </div>
                       </div>
                       <div className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                          dish.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                       }`}>
                          {dish.status}
                       </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-20 text-center glass-card border-dashed"
          >
             <AlertCircle size={48} className="text-white/10 mx-auto mb-4" />
             <p className="text-xs font-black uppercase tracking-widest text-white/30 italic">Tarix bo'limi ustida ish olib borilmoqda</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Seller
