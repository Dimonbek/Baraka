import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, CheckCircle2, DollarSign, Zap, Receipt, ChevronRight, PackageOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { InputGroup } from './InputGroup'
import { useTranslation } from '../i18n'

interface AddDishFormProps {
  onSuccess: () => void;
}

export function AddDishForm({ onSuccess }: AddDishFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState('Milliy taomlar');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error("Taom rasmini yuklang");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('original_price', price.toString());
    formData.append('discount_price', discount.toString());
    formData.append('quantity', quantity.toString());
    formData.append('image', image, image.name);

    try {
      await api.post('/api/v1/seller/dishes', formData);
      const tg = (window as any).Telegram.WebApp;
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      toast.success("Taom muvaffaqiyatli qo'shildi!");
      
      setName('');
      setPrice('');
      setDiscount('');
      setQuantity('1');
      setImage(null);
      setPreview(null);
      
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="emerald-glass p-8 space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-lg">
           <PackageOpen size={24} />
        </div>
        <div>
           <h2 className="text-xl font-black gradient-text tracking-tighter uppercase leading-none">{t('add_offer')}</h2>
           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Yangi mahsulot ma'lumotlarini kiriting</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmitDish} className="space-y-8">
        {/* Upload Area */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          onClick={() => document.getElementById('file-input-dash')?.click()}
          className="relative h-48 glass-card border-dashed border-white/20 cursor-pointer overflow-hidden group hover:border-emerald-500/30 transition-all duration-500"
        >
          <input 
            id="file-input-dash"
            type="file" 
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          {preview ? (
            <div className="w-full h-full relative group">
               <img src={preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
               <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-emerald-400 drop-shadow-[0_0_10px_#34d399]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Rasm Almashtirish</span>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 h-full transition-transform duration-500 group-hover:scale-105">
              <div className="w-16 h-16 bg-white/[0.03] rounded-3xl flex items-center justify-center mb-4 text-white/10 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all duration-500">
                <ImageIcon size={32} />
              </div>
              <span className="text-sm font-black text-white/40 uppercase tracking-tighter italic">Taom rasmini yuklang</span>
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-2 px-8 text-center leading-relaxed">JPG yoki PNG formatda, mahsulot aniq ko'rinsin</p>
            </div>
          )}
        </motion.div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-black uppercase tracking-widest px-1 opacity-60 font-sans">KATEGORIYA</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-card bg-white/[0.03] border-white/10 p-5 pr-10 text-sm focus:ring-2 ring-emerald-500/20 outline-none transition-all font-bold appearance-none uppercase tracking-wider"
              >
                <option value="Milliy taomlar" className="bg-[#020617]">🍛 Milliy taomlar</option>
                <option value="Fast-fud" className="bg-[#020617]">🍔 Fast-fud</option>
                <option value="Shirinliklar" className="bg-[#020617]">🧁 Shirinliklar</option>
                <option value="Salatlar" className="bg-[#020617]">🥗 Salatlar</option>
              </select>
              <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 rotate-90" />
            </div>
          </div>

          <InputGroup 
            label={t('dish_name')} 
            value={name} 
            onChange={setName} 
            placeholder="Masalan: Lavash, Burger..." 
            icon={<Receipt size={18}/>} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputGroup 
              label="ESKI NARX" 
              value={price} 
              onChange={setPrice} 
              placeholder="40,000" 
              type="number" 
              icon={<DollarSign size={16}/>} 
            />
            <InputGroup 
              label="CHEGIRMA NARX" 
              value={discount} 
              onChange={setDiscount} 
              placeholder="15,000" 
              type="number" 
              icon={<Zap size={16}/>} 
            />
          </div>
          
          <InputGroup 
            label="SONI (TA)" 
            value={quantity} 
            onChange={setQuantity} 
            placeholder="10" 
            type="number" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-500 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
        >
          {loading ? (
             <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-2 text-[12px] uppercase tracking-[0.2em]">
                {t('publish')}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
