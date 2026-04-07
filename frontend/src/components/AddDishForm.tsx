import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, CheckCircle2, DollarSign, Zap, Receipt, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { InputGroup } from './InputGroup'

interface AddDishFormProps {
  onSuccess: () => void;
}

export function AddDishForm({ onSuccess }: AddDishFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitDish = async (e: React.FormEvent) => {
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
      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
      toast.success("Taom muvaffaqiyatli qo'shildi!");
      
      setName('');
      setPrice('');
      setDiscount('');
      setQuantity('1');
      setImage(null);
      
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
    </>
  )
}
