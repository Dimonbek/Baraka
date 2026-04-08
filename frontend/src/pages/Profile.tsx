import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Globe, Phone, ChevronRight, Store, ShieldCheck, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { api } from '../services/api'
import { useTranslation } from '../i18n'

function Profile() {
  const { t, lang, setLanguage } = useTranslation();
  const [tgUser, setTgUser] = useState<any>(null);
  const [phone, setPhone] = useState(localStorage.getItem('user_phone') || '');
  const [name, setName] = useState('');

  useEffect(() => {
    const tg = (window as any).Telegram.WebApp;
    if (tg.initDataUnsafe?.user) {
      setTgUser(tg.initDataUnsafe.user);
    }
    
    // Fetch real profile from backend
    const fetchMe = async () => {
      try {
        const data = await api.get<any>('/api/v1/user/me');
        if (data.full_name) setName(data.full_name);
        if (data.phone_number) setPhone(data.phone_number);
      } catch (err) {
        console.error("Profile load failed", err);
      }
    };
    fetchMe();
  }, []);

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    toast.success("Til o'zgartirildi!");
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('full_name', name);
      formData.append('phone_number', phone);
      await api.post('/api/v1/user/update', formData);
      toast.success("Ma'lumotlar saqlandi!");
    } catch (err) {
      toast.error("Saqlashda xatolik yuz berdi");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <header className="mb-10 flex items-center gap-6 bento-card p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -mr-10 -mt-10" />
        <div className="w-24 h-24 bg-primary/10 ring-4 ring-primary/5 rounded-full flex items-center justify-center text-white text-4xl font-black relative overflow-hidden shadow-2xl">
           {tgUser?.photo_url ? (
             <img src={tgUser.photo_url} className="w-full h-full object-cover" />
           ) : (
             <span className="gradient-text">
               {tgUser?.first_name?.[0] || 'U'}
             </span>
           )}
        </div>
        <div className="relative">
          <h2 className="text-3xl font-black gradient-text tracking-tighter uppercase leading-none">
            {name || 'Foydalanuvchi'}
          </h2>
          <p className="text-tg-hint/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            @{tgUser?.username || 'user'}
          </p>
          <div className="flex items-center gap-2 mt-4 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 w-fit">
             <ShieldCheck size={12} />
             <span className="text-[10px] font-black uppercase tracking-wider italic">Verified Account</span>
          </div>
        </div>
      </header>

      <section className="space-y-12">
        {/* Profile Info */}
        <div className="space-y-6">
           <h3 className="text-[10px] text-tg-hint/40 font-black uppercase tracking-[0.4em] px-3">{t('personal_info')}</h3>
           <div className="bento-card p-8 space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] ml-1">{t('full_name')}</label>
                 <div className="flex items-center gap-4 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] opacity-80">
                    <User size={20} className="text-white/20" />
                    <input 
                      type="text" value={name} readOnly
                      className="bg-transparent border-none outline-none flex-1 text-base font-black tracking-tight"
                    />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] text-primary/60 font-black uppercase tracking-[0.2em] ml-1">{t('phone')}</label>
                 <div className="flex items-center gap-4 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.05] opacity-80">
                    <Phone size={20} className="text-white/20" />
                    <input 
                      type="tel" value={phone} readOnly
                      placeholder="+998 90 123 45 67"
                      className="bg-transparent border-none outline-none flex-1 text-base font-black tracking-tight placeholder:text-white/5"
                    />
                 </div>
              </div>
           </div>
        </div>


        {/* Language Selection */}
        <div className="space-y-6">
           <h3 className="text-[10px] text-tg-hint/40 font-black uppercase tracking-[0.4em] px-3">{t('lang_settings')}</h3>
           <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'uz-latin', label: "O'zbekcha (Lotin)" },
                { id: 'uz-cyrillic', label: "Ўзбекча (Кирилл)" },
                { id: 'ru', label: "Русский" }
              ].map((langItem) => (
                <button
                  key={langItem.id}
                  onClick={() => changeLanguage(langItem.id)}
                  className={`flex items-center justify-between p-6 rounded-[28px] border transition-all duration-500 ${
                    lang === langItem.id 
                    ? 'bg-primary/5 border-primary/40 text-white shadow-2xl' 
                    : 'bg-white/[0.02] border-white/[0.03] text-tg-hint/40'
                  }`}
                >
                  <div className="flex items-center gap-5">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lang === langItem.id ? 'bg-primary/20' : 'bg-white/5'}`}>
                        <Globe size={20} className={lang === langItem.id ? 'text-primary' : ''} />
                     </div>
                     <span className="text-sm font-black uppercase tracking-tight">{langItem.label}</span>
                  </div>
                  {lang === langItem.id && <Check size={20} className="text-primary" />}
                </button>
              ))}
           </div>
        </div>

        {/* Action Link */}
        <Link to="/seller" className="group bento-card p-8 border-primary/20 bg-primary/[0.02] flex items-center justify-between transition-all active:scale-[0.98] shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 group-hover:rotate-6 transition-transform">
               <Store size={32} />
             </div>
             <div>
                <span className="text-xl font-black block leading-none uppercase tracking-tighter">{t('seller_panel')}</span>
                <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest mt-2 inline-block italic">{t('restaurant_manage')}</span>
             </div>
          </div>
          <ChevronRight size={24} className="text-primary group-hover:translate-x-2 transition-transform" />
        </Link>
      </section>

      <footer className="mt-20 text-center pb-10">
         <p className="text-[10px] text-tg-hint/10 font-black uppercase tracking-[1.5em]">Barakatoping v2.0</p>
      </footer>
    </motion.div>
  )
}

export default Profile
