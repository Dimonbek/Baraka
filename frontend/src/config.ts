// Onlayn Render backendi manzili
export const API_BASE_URL = 'https://barakatoping-backend.onrender.com';

export const getFullUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};
