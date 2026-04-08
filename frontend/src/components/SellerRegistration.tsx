import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, Zap, ShieldCheck, BarChart3, Receipt, MapPin, ChevronRight, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { InputGroup } from './InputGroup'
import { FeatureCard } from './FeatureCard'
import { MapPicker } from './MapPicker'
import { useTranslation } from '../i18n'

interface SellerRegistrationProps {
  onSuccess: () => void;
}

export function SellerRegistration({ onSuccess }: SellerRegistrationProps) {
  const { t } = useTranslation();
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', regName);
    formData.append('address', regAddress);
    if (lat) formData.append('lat', lat.toString());
    if (lng) formData.append('lng', lng.toString());

    try {
      await api.post('/api/v1/seller/register', formData);
      toast.success("Restoran muvaffaqiyatli ro'yxatdan o'tdi!");
      
      const tg = (window as any).Telegram.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      
      onSuccess();
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 space-y-12"
    >
      <header className="text-center space-y-6">
          <div className="w-24 h-24 emerald-glass flex items-center justify-center mx-auto text-emerald-400 emerald-glow border-emerald-500/20 relative">
             <Store size={48} />
             <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl">
                <Sparkles size={16} />
             </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black gradient-text tracking-tighter uppercase leading-tight">Barakaga Hamkor Bo'ling</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 max-w-[280px] mx-auto leading-relaxed">
              Isrofni kamaytiring va biznesingizni yangi bosqichga olib chiqing
            </p>
          </div>
      </header>

      <div className="grid gap-4">
         <FeatureCard 
            icon={<Zap size={20} className="text-amber-400" />} 
            title="Tezkor Sotuvlar" 
            desc="Mahsulotlarni sanoqli daqiqalarda soting" 
         />
         <FeatureCard 
            icon={<ShieldCheck size={20} className="text-emerald-400" />} 
            title="Xavfsiz Tizim" 
            desc="Har bir buyurtma maxsus kod bilan tasdiqlanadi" 
         />
         <FeatureCard 
            icon={<BarChart3 size={20} className="text-blue-400" />} 
            title="Professional Analitika" 
            desc="Sotuvlar va daromadni real vaqtda kuzating" 
         />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="emerald-glass p-8 relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mt-20" />
         
         <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_12px_#34d399]" /> 
            <h2 className="text-[11px] text-white font-black uppercase tracking-[0.3em]">
               {t('register_restaurant')}
            </h2>
         </div>
         
         <form onSubmit={handleRegister} className="space-y-6">
            <InputGroup 
              label="Restoran yoki Kafe Nomi" 
              value={regName} 
              onChange={setRegName} 
              placeholder="Masalan: Milliy Taomlar" 
              icon={<Receipt size={18} />}
            />
            <InputGroup 
              label="Restoran Manzili" 
              value={regAddress} 
              onChange={setRegAddress} 
              placeholder="Shahar, ko'cha, uy raqami" 
              icon={<MapPin size={18} />}
            />

            <div className="space-y-2">
               <label className="text-[10px] text-white/30 font-black uppercase tracking-widest px-1">Xaritada belgilang</label>
               <div className="rounded-[24px] overflow-hidden border border-white/5 ring-1 ring-white/5">
                 <MapPicker onLocationSelect={(lat, lng) => { setLat(lat); setLng(lng); }} />
               </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !regName || !regAddress}
              className="w-full bg-emerald-500 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 group overflow-hidden relative"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2 uppercase tracking-[0.2em] text-[12px]">
                    {t('register')}
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </>
              )}
            </button>
         </form>
      </motion.div>

      <p className="text-[9px] text-white/20 text-center font-black uppercase tracking-[0.4em]">
         Hamkorlik • Baraka Toping • 2026
      </p>
    </motion.div>
  )
}
