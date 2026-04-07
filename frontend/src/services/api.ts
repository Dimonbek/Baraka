import { API_BASE_URL } from '../config';

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    let message = 'Xatolik yuz berdi';
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg; // Handling Pydantic validation errors
      } else {
        message = JSON.stringify(data.detail);
      }
    }
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  
  // Telegram WebApp InitData
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initData) {
    headers.set('X-Telegram-Init-Data', tg.initData);
  }

  // JSON and FormData Handling
  let fetchOptions: RequestInit = { ...options, headers };
  
  if (options.body instanceof FormData) {
    // Multipart/form-data so'rovlarida header o'chirilishi shart, browser o'zi belgilashi lozim.
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: 'Noma\'lum xatolik' };
    }
    throw new ApiError(response.status, errorData);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(path, { 
      ...options, 
      method: 'POST', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),
};
