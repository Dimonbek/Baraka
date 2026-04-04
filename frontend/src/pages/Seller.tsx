import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

function Seller() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [myDishes, setMyDishes] = useState<any[]>([]);

  const fetchData = () => {
    fetch(`${API_BASE_URL}/api/v1/seller/analytics`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(console.error);
    
    fetch(`${API_BASE_URL}/api/v1/seller/dishes/all`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => setMyDishes(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!image) {
      alert("Iltimos, taom rasmini yuklang! 📸");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('original_price', price);
    formData.append('discount_price', discount);
    formData.append('quantity', quantity);
    formData.append('image', image);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/seller/dishes`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });

      if (response.ok) {
        alert("Taom muvaffaqiyatli qo'shildi! ✅");
        setName('');
        setPrice('');
        setDiscount('');
        setQuantity('1');
        setImage(null);
        fetchData(); // Ma'lumotlarni yangilash
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert("Xatolik yuz berdi ❌");
      }
    } catch (error) {
      console.error(error);
      alert("Serverga ulanishda xatolik ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 pb-32 font-sans overflow-x-hidden">
      <h2 className="text-2xl font-black mb-6">Mening Analitikam 📊</h2>
      
      {analytics ? (
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
             <div className="text-[10px] text-tg-hint uppercase font-bold mb-1">Jami Sotuv</div>
             <div className="text-2xl font-black text-tg-button">{analytics.total_orders}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
             <div className="text-[10px] text-tg-hint uppercase font-bold mb-1">Jami Daromad</div>
             <div className="text-xl font-black text-orange-500">{analytics.total_revenue.toLocaleString()} s.</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
             <div className="text-[10px] text-tg-hint uppercase font-bold mb-1">Aktiv Takliflar</div>
             <div className="text-2xl font-black text-cyan-500">{analytics.active_dishes}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
             <div className="text-[10px] text-tg-hint uppercase font-bold mb-1">Jami Taomlar</div>
             <div className="text-2xl font-black text-emerald-500">{analytics.total_dishes}</div>
          </div>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-tg-hint animate-pulse font-bold">Analitika yuklanmoqda...</div>
      )}

      <h2 className="text-2xl font-black mb-6">Yangi taom qo'shish 🏪</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
          <label className="block text-tg-hint text-xs font-bold uppercase mb-4 text-left">Taom rasmi</label>
          
          <input 
            id="file-input"
            type="file" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          <div 
            onClick={() => document.getElementById('file-input')?.click()}
            className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-tg-button transition-colors"
          >
            {image ? (
              <div className="text-sm font-bold text-tg-button">
                 📸 {image.name} tanlandi
              </div>
            ) : (
              <>
                <span className="text-4xl mb-2">📸</span>
                <span className="text-xs text-tg-hint font-medium">Rasm yuklash uchun bosing</span>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-tg-hint text-xs font-bold uppercase mb-1 px-1">Taom nomi</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-tg-button outline-none transition-all"
            placeholder="Masalan: Milliy taom, Lavash..."
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-tg-hint text-xs font-bold uppercase mb-1 px-1">Asl narxi</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-tg-button outline-none transition-all"
              placeholder="40000"
              required
            />
          </div>
          <div>
            <label className="block text-tg-hint text-xs font-bold uppercase mb-1 px-1">Chegirma narxi</label>
            <input 
              type="number" 
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-tg-button outline-none transition-all"
              placeholder="15000"
              required
            />
          </div>
        </div>

        <div>
           <label className="block text-tg-hint text-xs font-bold uppercase mb-1 px-1">Soni (Portsiya)</label>
           <input 
             type="number" 
             value={quantity}
             onChange={(e) => setQuantity(e.target.value)}
             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-tg-button outline-none transition-all"
             placeholder="10"
             required
           />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-tg-button text-white font-black p-5 rounded-2xl shadow-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? "Rasm yuklanmoqda..." : "TAOMNI SOTUVGA CHIQARISH"}
        </button>
      </form>

      <div className="mt-12">
         <h2 className="text-2xl font-black mb-6">Mening taomlarim 🍱</h2>
         <div className="grid gap-4">
            {myDishes.length === 0 ? (
              <div className="py-10 text-center text-tg-hint font-bold italic bg-white/5 rounded-2xl border border-white/10">Sizda hali taomlar yo'q</div>
            ) : (
              myDishes.map(dish => (
                <div key={dish.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center opacity-90">
                   <img src={dish.image_url} className="w-12 h-12 rounded-lg object-cover grayscale-[0.5]" />
                   <div className="flex-1">
                      <div className="font-bold text-sm">{dish.name}</div>
                      <div className="text-[10px] text-tg-hint">{dish.discount_price.toLocaleString()} s. | {dish.quantity} ta qoldi</div>
                   </div>
                   <div className={`text-[9px] font-black uppercase px-2 py-1 rounded ${dish.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                      {dish.status}
                   </div>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  )
}

export default Seller
