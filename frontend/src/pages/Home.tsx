import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

interface Dish {
  id: number;
  restaurant_name: string;
  name: string;
  original_price: number;
  discount_price: number;
  pickup_start: string;
  pickup_end: string;
  image_url: string;
  quantity: number;
  restaurant_id: number;
  is_favorite: boolean;
  distance_km?: number;
}

function Home() {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [bookingStatus, setBookingStatus] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  useEffect(() => {
    // Avvalroq saqlangan joylashuvni tekshirish
    const savedLat = localStorage.getItem('user_lat');
    const savedLng = localStorage.getItem('user_lng');
    if (savedLat && savedLng) {
      setUserLocation({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
    }

    // Geolokatsiyani yangilash
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        localStorage.setItem('user_lat', latitude.toString());
        localStorage.setItem('user_lng', longitude.toString());
      }, (err) => {
        console.warn("Geolocation denied or error", err);
      });
    }
  }, []);

  useEffect(() => {
    let url = `${API_BASE_URL}/api/v1/buyer/dishes`;
    if (userLocation) {
      url += `?lat=${userLocation.lat}&lng=${userLocation.lng}`;
    }

    fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        setDishes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dishes", err);
        setLoading(false);
      });
  }, [userLocation]);

  const handleBook = async (dishId: number) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/orders?dish_id=${dishId}&quantity=${orderQuantity}`, { 
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await resp.json();
      if (resp.ok) {
        setBookingStatus(data);
      } else {
        alert("Bron qilishda xatolik yub berdi!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (dish: Dish, e: React.MouseEvent) => {
    e.stopPropagation();
    const tg = (window as any).Telegram.WebApp;
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }

    const method = dish.is_favorite ? 'DELETE' : 'POST';
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/favorites/${dish.restaurant_id}`, { method });
      if (resp.ok) {
        setDishes(prev => prev.map(d => 
          d.restaurant_id === dish.restaurant_id ? { ...d, is_favorite: !dish.is_favorite } : d
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24">
      <header className="mb-6 flex justify-between items-start">
        <div>
           <h1 className="text-3xl font-black mb-1 tracking-tight">Barakatoping 🍱</h1>
           <p className="text-tg-hint text-sm">Bugun asrab qolishingiz mumkin bo'lgan taomlar</p>
        </div>
        <button 
          onClick={async () => {
            const resp = await fetch(`${API_BASE_URL}/api/v1/notifications`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
            const data = await resp.json();
            setNotifications(data);
            setShowNotifications(true);
          }}
          className="relative bg-white/5 border border-white/10 p-3 rounded-2xl active:scale-95 transition-transform"
        >
          <span className="text-xl">🔔</span>
          {notifications.some(n => !n.is_read) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-tg-bg"></span>}
        </button>
      </header>

      {loading ? (
        <div className="py-20 text-center text-tg-hint animate-pulse font-bold">Yuklanmoqda...</div>
      ) : (
        <div className="grid gap-4">
          {dishes.map(dish => (
            <div 
              key={dish.id} 
              onClick={() => setSelectedDish(dish)}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 active:scale-95 transition-transform"
            >
              <img 
                src={dish.image_url} 
                className="w-20 h-20 rounded-xl object-cover"
                onError={(e) => e.currentTarget.src = 'https://premium.uz/storage/app/media/default.jpg'}
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                   <div className="text-[10px] text-tg-button font-black uppercase tracking-widest">{dish.restaurant_name}</div>
                   <h3 className="text-lg font-bold">{dish.name}</h3>
                </div>
                <div className="flex justify-between items-end">
                   <div className="flex flex-col">
                      <div className="text-[10px] text-tg-hint line-through font-bold">{dish.original_price.toLocaleString()} s.</div>
                      <div className="text-orange-500 text-lg font-black">{dish.discount_price.toLocaleString()} so'm</div>
                      {dish.distance_km && <div className="text-[9px] text-tg-hint font-bold">{dish.distance_km} km uzoqlikda 📍</div>}
                   </div>
                    <div className="text-[10px] text-tg-hint italic font-medium">
                       <div>{dish.pickup_end} gacha</div>
                       <div className="text-emerald-500 font-bold">{dish.quantity} ta qoldi</div>
                    </div>
                </div>

                {/* Heart Button */}
                <button 
                  onClick={(e) => toggleFavorite(dish, e)}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-sm shadow-sm active:scale-125 transition-transform"
                >
                  {dish.is_favorite ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDish && !bookingStatus && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-in fade-in slide-in-from-bottom duration-300">
           <div className="bg-tg-bg w-full rounded-t-3xl p-8 pb-12 shadow-2xl border-t border-white/10">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
              <img 
                src={selectedDish.image_url} 
                className="w-full h-48 rounded-2xl object-cover mb-4"
              />
              <h2 className="text-2xl font-black mb-2">{selectedDish.name}</h2>
              <div className="flex items-center gap-2 mb-6">
                 <span className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded">-{Math.round((1 - selectedDish.discount_price/selectedDish.original_price)*100)}%</span>
                 <span className="text-tg-hint line-through text-sm">{selectedDish.original_price.toLocaleString()} so'm</span>
              </div>
              <p className="text-tg-hint text-sm mb-4 leading-relaxed">
                 Ushbu taomni bron qilish orqali siz ham isrofga qarshi kurashasiz va mazali taomni arzon narxda olasiz. 
                 Iltimos, bronni o'z vaqtida pick-up qilib oling.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 flex items-center justify-between">
                 <div className="text-sm font-bold">Nechta portsiya?</div>
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="w-10 h-10 bg-white/10 rounded-xl font-black text-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      -
                    </button>
                    <div className="text-xl font-black w-8 text-center">{orderQuantity}</div>
                    <button 
                      onClick={() => setOrderQuantity(Math.min(selectedDish.quantity, orderQuantity + 1))}
                      className="w-10 h-10 bg-white/10 rounded-xl font-black text-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      +
                    </button>
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setSelectedDish(null)} className="flex-1 bg-white/10 p-4 rounded-2xl font-bold">Yopish</button>
                 <button onClick={() => handleBook(selectedDish.id)} className="flex-[2] bg-tg-button text-white p-4 rounded-2xl font-black shadow-lg shadow-tg-button/20 active:scale-95 transition-transform">
                    Bron qilish (+1500 XP)
                 </button>
              </div>
              {/* Bottom Spacer for Mobile Menu */}
              <div className="h-10"></div>
           </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingStatus && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-6 z-[60] animate-in zoom-in-95 duration-300">
           <div className="bg-tg-bg border border-white/10 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-black mb-2">Muvaffaqiyatli!</h2>
              <p className="text-tg-hint text-sm mb-8">Sizga berilgan bron kodi:</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                 <span className="text-5xl font-black tracking-widest text-tg-button">
                   {bookingStatus.verification_code}
                 </span>
              </div>
              <p className="text-xs text-orange-500 mb-8 font-bold animate-pulse">
                🔥 Diqqat: Ushbu bron faqat 30 daqiqa davomida amal qiladi!
              </p>
              <button 
                onClick={() => { 
                  setBookingStatus(null); 
                  setSelectedDish(null); 
                  navigate('/orders');
                }} 
                className="w-full bg-tg-button text-white p-4 rounded-2xl font-black active:scale-95 transition-transform"
              >
                Mening buyurtmalarimga o'tish
              </button>
           </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-[100] animate-in fade-in slide-in-from-bottom duration-300">
           <div className="bg-tg-bg w-full rounded-t-3xl p-8 shadow-2xl border-t border-white/10 max-h-[80vh] overflow-y-auto">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
              <h2 className="text-xl font-black mb-6">Bildirishnomalar 🔔</h2>
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-tg-hint font-bold italic">Hozircha xabarlar yo'q</div>
              ) : (
                <div className="grid gap-4">
                   {notifications.map((n: any) => (
                      <div key={n.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                         <div className="text-[10px] text-tg-button font-black uppercase mb-1">{n.type}</div>
                         <h4 className="font-bold mb-1">{n.title}</h4>
                         <p className="text-xs text-tg-hint">{n.message}</p>
                      </div>
                   ))}
                </div>
              )}
              <button 
                onClick={() => setShowNotifications(false)} 
                className="w-full bg-white/10 p-4 rounded-2xl font-bold mt-8"
              >
                Yopish
              </button>
              <div className="h-10"></div>
           </div>
        </div>
      )}
    </div>
  )
}

export default Home
