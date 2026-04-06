import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, PlusCircle, Image as ImageIcon, CheckCircle2, TrendingUp, Package, DollarSign, Activity, ChevronRight, Store, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'

function Seller() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myDishes, setMyDishes] = useState<any[]>([]);

  const fetchData = async () => {
    setFetching(true);
    setError(false);
    try {
      const [analyticsData, dishesData] = await Promise.all([
        api.get('/api/v1/seller/analytics'),
        api.get<any[]>('/api/v1/seller/dishes/all')
      ]);
      setAnalytics(analyticsData);
      setMyDishes(dishesData);
    } catch (err) {
      setError(true);
      toast.error("Ma'lumotlarni yuklab bo'lmadi");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: any) => {
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
      fetchData();
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32"
    >
      <header className="mb-10 flex items-center gap-4">
         <div className="w-14 h-14 glass-card flex items-center justify-center text-primary border-primary/20 bg-primary/5">
            <Store size={28} />
         </div>
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Sotuvchi Paneli</h1>
            <p className="text-tg-hint text-[11px] font-medium uppercase tracking-[0.1em] opacity-80 mt-1">
              Restoran boshqaruv tizimi
            </p>
         </div>
      </header>
      
      {error ? (
        <div className="py-20 text-center flex flex-col items-center">
           <AlertCircle size={48} className="text-red-500/50 mb-4" />
           <p className="text-tg-hint font-medium mb-6">Analitikani yuklab bo'lmadi</p>
           <button onClick={fetchData} className="glass-card px-8 py-2 text-sm font-bold border-white/10">Yangilash</button>
        </div>
      ) : fetching ? (
        <div className="grid grid-cols-2 gap-4 mb-12">
          {[1,2,3,4].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)}
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
         <div className="w-1 h-3 bg-white/20 rounded-full" /> Yangi taklif qo'shish
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 mb-16">
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
          <InputGroup label="Taom nomi" value={name} onChange={setName} placeholder="Masalan: Lavash, Milliy taom..." />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Asl narxi" value={price} onChange={setPrice} placeholder="40,000" type="number" />
            <InputGroup label="Chegirma narxi" value={discount} onChange={setDiscount} placeholder="15,000" type="number" />
          </div>
          <InputGroup label="Soni (Portsiya)" value={quantity} onChange={setQuantity} placeholder="10" type="number" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <div className="flex items-center gap-2">
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               Yuklanmoqda...
            </div>
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
        {!fetching && myDishes.length === 0 ? (
          <div className="py-12 text-center glass-card border-white/5 opacity-50 italic text-sm">Hali takliflar yo'q</div>
        ) : (
          myDishes.map((dish, i) => (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               key={dish.id} 
               className="glass-card p-4 flex gap-4 items-center border-white/5 ring-1 ring-white/5 group hover:bg-white/5"
            >
               <img src={dish.image_url} className="w-14 h-14 rounded-xl object-cover ring-1 ring-white/10" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
               <div className="flex-1">
                  <div className="font-bold text-[15px] group-hover:text-primary transition-colors">{dish.name}</div>
                  <div className="text-[10px] text-tg-hint font-medium opacity-60 mt-0.5">
                    {dish.discount_price.toLocaleString()} s. • {dish.quantity} ta qoldi
                  </div>
               </div>
               <div className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ring-1 ${
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: any, color: string }) {
  return (
    <div className="glass-card p-5 border-white/5 bg-white/5 relative overflow-hidden group">
       <div className={`absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity ${color}`}>
          {icon}
       </div>
       <div className="text-[10px] text-tg-hint uppercase font-bold tracking-wider mb-2 opacity-70">{label}</div>
       <div className={`text-2xl font-black ${color} tracking-tight`}>{value}</div>
    </div>
  )
}

function InputGroup({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-tg-hint font-bold uppercase tracking-widest px-1 opacity-70">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full glass-card bg-white/5 border-white/10 p-5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-white/10"
        placeholder={placeholder}
        required
      />
    </div>
  )
}

export default Seller
