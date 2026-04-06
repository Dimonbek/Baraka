import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Settings, PhoneCall, LogOut, ChevronRight, Store, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram.WebApp;
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <header className="mb-10 flex items-center gap-5 glass-card p-6 border-white/5 bg-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10" />
        <div className="w-20 h-20 bg-primary/20 ring-4 ring-primary/10 rounded-full flex items-center justify-center text-white text-3xl font-black relative overflow-hidden shadow-2xl">
           {user?.photo_url ? (
             <img src={user.photo_url} className="w-full h-full object-cover" />
           ) : (
             <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
               {user?.first_name?.[0] || 'U'}
             </span>
           )}
        </div>
        <div className="relative">
          <h2 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
            {user?.first_name || 'Mehmon'} {user?.last_name || ''}
          </h2>
          <p className="text-tg-hint text-xs font-medium opacity-70 mt-1">
            @{user?.username || 'username_yoq'}
          </p>
          <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">
             <ShieldCheck size={10} />
             <span className="text-[9px] font-bold uppercase tracking-wider">Tasdiqlangan</span>
          </div>
        </div>
      </header>

      <section className="grid gap-4">
        <h3 className="text-[10px] text-tg-hint font-bold uppercase tracking-[0.2em] px-2 mb-1 flex items-center gap-2">
           <div className="w-1 h-3 bg-primary rounded-full" /> Boshqaruv
        </h3>
        
        <Link to="/seller" className="group glass-card p-5 bg-primary/5 hover:bg-primary/10 border-primary/20 shadow-xl shadow-primary/5 flex items-center justify-between ring-1 ring-primary/20 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
               <Store size={20} />
             </div>
             <div>
                <span className="text-[15px] font-bold block">Sotuvchi paneli</span>
                <span className="text-[10px] text-primary font-medium opacity-80">Restoran va taomlarni boshqarish</span>
             </div>
          </div>
          <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="h-4" />
        <h3 className="text-[10px] text-tg-hint font-bold uppercase tracking-[0.2em] px-2 mb-1 flex items-center gap-2">
           <div className="w-1 h-3 bg-white/20 rounded-full" /> Tizim
        </h3>

        <MenuButton icon={<Settings size={18} />} label="Sozlamalar" info="Xabarnomalar va til" />
        <MenuButton icon={<PhoneCall size={18} />} label="Qo'llab-quvvatlash" info="Biz bilan bog'laning" />
        <button className="w-full text-left p-5 glass-card border-white/5 active:bg-white/10 flex items-center justify-between group transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10 transition-colors">
              <LogOut size={20} />
            </div>
            <div>
               <span className="text-[15px] font-bold block text-red-500/90 group-active:text-red-600 transition-colors">Chiqish</span>
               <span className="text-[10px] text-tg-hint font-medium opacity-60 italic">Tizimdan chiqish</span>
            </div>
          </div>
        </button>
      </section>

      <footer className="mt-16 text-center">
         <p className="text-[10px] text-tg-hint/30 font-bold uppercase tracking-[0.5em]">Barakatoping v2.0</p>
      </footer>
    </motion.div>
  )
}

function MenuButton({ icon, label, info }: { icon: React.ReactNode, label: string, info?: string }) {
  return (
    <button className="group w-full text-left p-5 glass-card border-white/5 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 ring-1 ring-white/5 group-hover:text-primary group-hover:ring-primary/20 transition-all">
          {icon}
        </div>
        <div>
           <span className="text-[15px] font-bold block group-hover:text-primary transition-colors">{label}</span>
           {info && <span className="text-[10px] text-tg-hint font-medium opacity-60">{info}</span>}
        </div>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-primary/50 group-hover:translate-x-1 transition-transform" />
    </button>
  )
}

export default Profile
