import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
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
  }, []);

  return (
    <Router>
      <div className="p-4 min-h-screen bg-tg-bg text-tg-text font-sans">
        
        {/* Main Content Area */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/seller" element={<Seller />} />
        </Routes>

        {/* Bottom Navigation Navbar */}
        <nav className="fixed bottom-0 left-0 right-0 p-4 bg-tg-bg/90 backdrop-blur-xl border-t border-black/5 flex justify-around items-center z-50">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-tg-button scale-110' : 'text-tg-hint'}`}
          >
            <span className="text-2xl">🏠</span>
            <span className="text-[10px] font-bold">Asosiy</span>
          </NavLink>
          
          <NavLink 
            to="/orders" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-tg-button scale-110' : 'text-tg-hint'}`}
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-[10px] font-bold">Buyurtmalar</span>
          </NavLink>
          
          <NavLink 
            to="/favorites" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-tg-button scale-110' : 'text-tg-hint'}`}
          >
            <span className="text-2xl">⭐</span>
            <span className="text-[10px] font-bold">Saralangan</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-tg-button scale-110' : 'text-tg-hint'}`}
          >
            <span className="text-2xl">👤</span>
            <span className="text-[10px] font-bold">Profil</span>
          </NavLink>
        </nav>
        
        {/* Safe Area Spacer for Navbar */}
        <div className="h-20"></div>
      </div>
    </Router>
  )
}

export default App
