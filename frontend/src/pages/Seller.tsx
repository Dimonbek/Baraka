import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, PlusCircle, Image as ImageIcon, CheckCircle2, TrendingUp, Package, DollarSign, Activity, ChevronRight, Store, AlertCircle, MapPin, Receipt, ShieldCheck, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

function Seller() {
  // Seller State
  const [profile, setProfile] = useState<any>(null);
  const [isSeller, setIsSeller] = useState<boolean | null>(null);

  // New Dish Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  
  // General State
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myDishes, setMyDishes] = useState<any[]>([]);

  const fetchProfile = async () => {
    try {
      const data = await api.get<any>('/api/v1/seller/profile');
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
        api.get('/api/v1/seller/analytics'),
        api.get<any[]>('/api/v1/seller/dishes/all')
      ]);
      setAnalytics(analyticsData);
      setMyDishes(dishesData);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', regName);
    formData.append('address', regAddress);

    try {
      await api.post('/api/v1/seller/register', formData);
      toast.success("Restoran muvaffaqiyatli ro'yxatdan o'tdi!");
      
      const tg = (window as any).Telegram.WebApp;
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      
      // Refresh state
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDish = async (e: any) => {
    e.preventDefault();
    if (!image) {
      toast.error("Taom rasmini yuklang");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('original_price', price);
    formData.append('discount_price', discount);
    formData.append('quantity', quantity);
    formData.append('image', image);

    try {
      await api.post('/api/v1/seller/dishes', formData);
      const tg = (window as any).Telegram.WebApp;
      if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      toast.success("Taom muvaffaqiyatli qo'shildi!");
      
      setName('');
      setPrice('');
      setDiscount('');
      setQuantity('1');
      setImage(null);
      fetchDashboardData();
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-20"
      >
        <header className="mb-8 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary ring-4 ring-primary/5 shadow-2xl">
               <Store size={40} />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">Barakaga hamkor bo'ling</h1>
            <p className="text-tg-hint text-sm max-w-[280px] mx-auto opacity-70">
              Isrofni kamaytiring va biznesingiz uchun qo'shimcha foyda keltiring.
            </p>
        </header>

        <div className="grid gap-4 mb-10">
           <FeatureCard 
              icon={<Zap size={20} className="text-yellow-400" />} 
              title="Tezkor sotuvlar" 
              desc="Tez buziladigan mahsulotlaringizni sanoqli daqiqalarda soting" 
           />
           <FeatureCard 
              icon={<ShieldCheck size={20} className="text-emerald-400" />} 
              title="Ishonchli to'lov" 
              desc="Xaridorlar buyurtmani joyida tasdiqlashadi" 
           />
           <FeatureCard 
              icon={<BarChart3 size={20} className="text-primary" />} 
              title="Analitika" 
              desc="Sotuvlaringiz soni va daromadingizni kuzatib boring" 
           />
        </div>

        <div className="glass-card p-6 border-primary/20 bg-primary/5 relative overflow-hidden mb-8">
           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
           <h2 className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> 
              Restoran ro'yxatdan o'tkazish
           </h2>
           
           <form onSubmit={handleRegister} className="space-y-5">
              <InputGroup 
                label="Restoran yoki Kafe nomi" 
                value={regName} 
                onChange={setRegName} 
                placeholder="Masalan: Milliy Taomlar" 
                icon={<Receipt size={16} />}
              />
              <InputGroup 
                label="Manzil" 
                value={regAddress} 
                onChange={setRegAddress} 
                placeholder="Shahar, ko'cha, uy raqami" 
                icon={<MapPin size={16} />}
              />
              
              <button 
                type="submit" 
                disabled={loading || !regName || !regAddress}
                className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 mt-4"
              >
                {loading ? "YUBORILMOQDA..." : "RO'YXATDAN O'TISH"}
                {!loading && <ChevronRight size={18} />}
              </button>
           </form>
        </div>

        <p className="text-[10px] text-tg-hint text-center font-bold uppercase tracking-widest opacity-40">
           Baraka Toping Hamkorlik Dasturi
        </p>
      </motion.div>
    )
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
               <h1 className="text-2xl font-black tracking-tight">{profile.restaurant?.name}</h1>
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

      {/* Add New Dish */}
      <h2 className="text-[10px] text-tg-hint font-bold uppercase tracking-[0.2em] px-2 mb-4 flex items-center gap-2">
         <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> 
         Yangi taklif qo'shish
      </h2>
      
      <form onSubmit={handleSubmitDish} className="space-y-6 mb-16">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          onClick={() => document.getElementById('file-input')?.click()}
          className="glass-card p-6 border-dashed border-white/20 cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group"
        >
          <input 
            id="file-input"
            type="file" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
          {image ? (
            <div className="text-center animate-fade-in">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-primary" />
               </div>
               <span className="text-sm font-bold text-white/90">{image.name}</span>
               <p className="text-[10px] text-tg-hint mt-1">Rasm yuklandi</p>
            </div>
          ) : (
            <div className="text-center group-hover:scale-110 transition-transform">
              <ImageIcon size={48} className="text-white/10 mx-auto mb-4" />
              <span className="text-sm font-bold text-white/50">Taom rasmini yuklang</span>
              <p className="text-[10px] text-tg-hint mt-1">JPG, PNG formatlar tavsiya etiladi</p>
            </div>
          )}
        </motion.div>

        <div className="space-y-4">
          <InputGroup label="Taom nomi" value={name} onChange={setName} placeholder="Masalan: Lavash, Burger..." icon={<Receipt size={16}/>} />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Asl narxi" value={price} onChange={setPrice} placeholder="40,000" type="number" icon={<DollarSign size={16}/>} />
            <InputGroup label="Chegirma narxi" value={discount} onChange={setDiscount} placeholder="15,000" type="number" icon={<Zap size={16}/>} />
          </div>
          <InputGroup label="Soni (Portsiya)" value={quantity} onChange={setQuantity} placeholder="10" type="number" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              SOTUVGA CHIQARISH
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

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
                  dish.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-red-500/10 text-red-500 ring-red-500/20'
               }`}>
                  {dish.status}
               </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc }: any) {
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: any, color: string }) {
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

function InputGroup({ label, value, onChange, placeholder, type = "text", icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-tg-hint font-black uppercase tracking-widest px-1 opacity-40">{label}</label>
      <div className="relative group">
         {icon && (
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
              {icon}
           </div>
         )}
         <input 
            type={type} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full glass-card bg-white/5 border-white/10 ${icon ? 'pl-11' : 'pl-5'} p-4 text-sm focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-white/10 font-medium`}
            placeholder={placeholder}
            required
         />
      </div>
    </div>
  )
}

export default Seller
