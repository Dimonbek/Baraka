import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'
import { Link } from 'react-router-dom'

interface FavoriteRestaurant {
  id: number;
  name: string;
  address: string;
}

function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/favorites`)
      .then(res => res.json())
      .then(data => {
        setFavorites(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="py-20 text-center text-tg-hint animate-pulse font-bold">Yuklanmoqda...</div>;

  return (
    <div className="py-6 px-4">
      <header className="mb-8 items-start">
        <h1 className="text-3xl font-black mb-1 tracking-tight">Saralanganlar ⭐</h1>
        <p className="text-tg-hint text-sm">Sizga yoqqan restoranlar va kafelar</p>
      </header>

      {favorites.length === 0 ? (
        <div className="py-20 text-center bg-white/5 border border-white/10 rounded-3xl p-10">
          <div className="text-6xl mb-6 opacity-30">⭐</div>
          <h2 className="text-xl font-bold mb-2">Hali hech narsa yo'q</h2>
          <p className="text-tg-hint text-sm mb-8">Sevimli restoranlaringizni "Asosiy" bo'limidan yurakcha orqali qo'shishingiz mumkin.</p>
          <Link to="/" className="inline-block bg-tg-button text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-transform">
            Ko'rib chiqish
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map(res => (
            <div key={res.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between group active:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tg-button/20 rounded-xl flex items-center justify-center text-2xl">
                  🏘️
                </div>
                <div>
                  <h3 className="font-bold text-lg">{res.name}</h3>
                  <p className="text-[11px] text-tg-hint uppercase font-black tracking-widest">{res.address || "Manzil ko'rsatilmagan"}</p>
                </div>
              </div>
              <div className="text-rose-500 text-2xl">❤️</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
