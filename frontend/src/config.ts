// Avtomatik moslashuvchan URL: Agar Vercel'da ishlayotgan bo'lsa (yoki lokal bo'lmasa) avtomat Render'ga yuboramiz.
let apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://barakatoping-backend.onrender.com';
}
export const API_BASE_URL = apiUrl;
