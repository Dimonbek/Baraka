import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Globe, Phone, ChevronRight, Store, ShieldCheck, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
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
      setName(tg.initDataUnsafe.user.first_name + (tg.initDataUnsafe.user.last_name ? ' ' + tg.initDataUnsafe.user.last_name : ''));
    }
  }, []);

  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    toast.success("Til o'zgartirildi!");
  };

  const saveProfile = () => {
    localStorage.setItem('user_phone', phone);
    toast.success("Ma'lumotlar saqlandi!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pb-32"
    >
      <header className="mb-10 flex items-center gap-6 glass-card p-6 border-white/5 bg-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10" />
        <div className="w-20 h-20 bg-primary/20 ring-4 ring-primary/10 rounded-full flex items-center justify-center text-white text-3xl font-black relative overflow-hidden shadow-2xl">
           {tgUser?.photo_url ? (
             <img src={tgUser.photo_url} className="w-full h-full object-cover" />
           ) : (
             <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
               {tgUser?.first_name?.[0] || 'U'}
             </span>
           )}
        </div>
        <div className="relative">
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            {name || 'Foydalanuvchi'}
          </h2>
          <p className="text-tg-hint text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">
            @{tgUser?.username || 'user'}
          </p>
          <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">
             <ShieldCheck size={10} />
             <span className="text-[9px] font-black uppercase tracking-wider italic">Verified</span>
          </div>
        </div>
      </header>

      <section className="space-y-10">
        {/* Profile Info */}
        <div className="space-y-4">
           <h3 className="text-[10px] text-tg-hint font-black uppercase tracking-[0.3em] px-2 opacity-40">{t('personal_info')}</h3>
           <div className="glass-card p-6 border-white/5 space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] text-primary/60 font-black uppercase tracking-widest ml-1">{t('full_name')}</label>
                 <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <User size={18} className="text-white/20" />
                    <input 
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="bg-transparent border-none outline-none flex-1 text-sm font-bold"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] text-primary/60 font-black uppercase tracking-widest ml-1">{t('phone')}</label>
                 <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Phone size={18} className="text-white/20" />
                    <input 
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      className="bg-transparent border-none outline-none flex-1 text-sm font-bold placeholder:text-white/10"
                    />
                 </div>
              </div>
              <button 
                onClick={saveProfile}
                className="w-full bg-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all text-white/50"
              >
                {t('save_changes')}
              </button>
           </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-4">
           <h3 className="text-[10px] text-tg-hint font-black uppercase tracking-[0.3em] px-2 opacity-40">{t('lang_settings')}</h3>
           <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'uz-latin', label: "O'zbekcha (Lotin)" },
                { id: 'uz-cyrillic', label: "Ўзбекча (Кирилл)" },
                { id: 'ru', label: "Русский" }
              ].map((langItem) => (
                <button
                  key={langItem.id}
                  onClick={() => changeLanguage(langItem.id)}
                  className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                    lang === langItem.id 
                    ? 'bg-primary/10 border-primary/30 text-white' 
                    : 'bg-white/5 border-white/5 text-tg-hint opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <Globe size={18} className={lang === langItem.id ? 'text-primary' : ''} />
                     <span className="text-sm font-bold">{langItem.label}</span>
                  </div>
                  {lang === langItem.id && <Check size={18} className="text-primary" />}
                </button>
              ))}
           </div>
        </div>

        {/* Action Link */}
        <Link to="/seller" className="group glass-card p-6 border-primary/20 bg-primary/5 flex items-center justify-between transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
               <Store size={24} />
             </div>
             <div>
                <span className="text-lg font-black block leading-none">{t('seller_panel')}</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 inline-block">{t('restaurant_manage')}</span>
             </div>
          </div>
          <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

      <footer className="mt-20 text-center pb-10">
         <p className="text-[10px] text-tg-hint/20 font-black uppercase tracking-[1em]">Barakatoping v2.0</p>
      </footer>
    </motion.div>
  )
}

export default Profile
