import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Zap, ShieldCheck, BarChart3, Receipt, MapPin, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { InputGroup } from './InputGroup'
import { FeatureCard } from './FeatureCard'

interface SellerRegistrationProps {
  onSuccess: () => void;
}

export function SellerRegistration({ onSuccess }: SellerRegistrationProps) {
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

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
