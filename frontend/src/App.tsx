import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { BottomNav } from './components/BottomNav'
import Home from './pages/Home'
import Cart from './pages/Cart' // Yangi va silliqlangan savat
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Seller from './pages/Seller'

function App() {
  
  useEffect(() => {
    const tg = (window as any).Telegram.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-primary/30 antialiased overflow-x-hidden">
        
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />

        <main className="max-w-md mx-auto px-5 pt-8 pb-32">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<Cart />} />
              <Route path="/cart" element={<Cart />} /> { /*ikkala yo'nalish ham bitta savatga chiqadi */ }
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/seller" element={<Seller />} />
            </Routes>
          </AnimatePresence>
        </main>

        <BottomNav />
      </div>
    </Router>
  )
}

export default App
