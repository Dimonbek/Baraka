import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { Home as HomeIcon, ShoppingBag, Heart, User, Store } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Seller from './pages/Seller'

function App() {
  
  useEffect(() => {
    const tg = (window as any).Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-tg-bg text-tg-text font-sans selection:bg-primary/30">
        
        {/* Global Notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
            },
          }}
        />

        {/* Main Content Area */}
        <main className="max-w-md mx-auto px-4 pt-6 pb-24">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/seller" element={<Seller />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Navbar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
          <div className="flex items-center justify-around w-full max-w-sm h-16 glass-card px-4 border border-white/5 ring-1 ring-white/10 pointer-events-auto">
            <NavItem to="/" icon={<HomeIcon size={22} />} label="Asosiy" />
            <NavItem to="/orders" icon={<ShoppingBag size={22} />} label="Savat" />
            <NavItem to="/favorites" icon={<Heart size={22} />} label="Saralangan" />
            <NavItem to="/profile" icon={<User size={22} />} label="Profil" />
            <NavItem to="/seller" icon={<Store size={22} />} label="Sotuvchi" />
          </div>
        </nav>
      </div>
    </Router>
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

export default App
