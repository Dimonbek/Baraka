// Fallback URL used if VITE_API_URL is missing in environment
const DEFAULT_API_URL = 'https://barakatoping-backend.onrender.com';
export const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
