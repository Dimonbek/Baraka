import { NavLink } from 'react-router-dom'
import { Home as HomeIcon, ShoppingBag, Heart, User, Store } from 'lucide-react'
import { motion } from 'framer-motion'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <div className="flex items-center justify-around w-full max-w-sm h-16 glass-card px-4 border border-white/5 ring-1 ring-white/10 pointer-events-auto">
        <NavItem to="/" icon={<HomeIcon size={22} />} label="Asosiy" />
        <NavItem to="/orders" icon={<ShoppingBag size={22} />} label="Savat" />
        <NavItem to="/favorites" icon={<Heart size={22} />} label="Saralangan" />
        <NavItem to="/profile" icon={<User size={22} />} label="Profil" />
        <NavItem to="/seller" icon={<Store size={22} />} label="Sotuvchi" />
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex flex-col items-center justify-center gap-1 transition-all relative ${isActive ? 'text-primary' : 'text-tg-hint'}`}
    >
      {({ isActive }) => (
        <>
          <motion.div
            animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -2 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {icon}
          </motion.div>
          <span className="text-[10px] font-medium">{label}</span>
          {isActive && (
            <motion.div 
              layoutId="nav-active"
              className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full transition-transform"
            />
          )}
        </>
      )}
    </NavLink>
  )
}
