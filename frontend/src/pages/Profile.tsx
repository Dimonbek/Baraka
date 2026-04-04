import { useEffect, useState } from 'react'

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
    <div className="py-8 px-4">
      <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl">
        <div className="w-16 h-16 bg-tg-button rounded-full flex items-center justify-center text-white text-2xl font-bold">
           {user?.first_name?.[0] || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.first_name || 'Foydalanuvchi'} {user?.last_name || ''}</h2>
          <p className="text-tg-hint text-sm">@{user?.username || 'username_yoq'}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <Link to="/seller" className="w-full text-left p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm font-bold flex justify-between">
          <span>🏪 Sotuvchi paneli (Admin)</span>
          <span className="text-orange-500">›</span>
        </Link>
        <button className="w-full text-left p-4 bg-white/5 rounded-xl text-sm font-medium flex justify-between">
          <span>⚙️ Sozlamalar</span>
          <span className="text-tg-hint">›</span>
        </button>
        <button className="w-full text-left p-4 bg-white/5 rounded-xl text-sm font-medium flex justify-between">
          <span>📞 Qo'llab-quvvatlash</span>
          <span className="text-tg-hint">›</span>
        </button>
        <button className="w-full text-left p-4 bg-white/5 rounded-xl text-sm font-medium flex justify-between text-red-500">
          <span>🚪 Chiqish</span>
        </button>
      </div>
    </div>
  )
}

export default Profile
