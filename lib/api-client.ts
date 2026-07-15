"use client";

import { getWebApp } from "./telegram-webapp";

/**
 * Client tomonidagi API chaqiruvlari uchun yupqa wrapper.
 * Har so'rovga Telegram initData sarlavhasini qo'shadi va xatolarni
 * o'zbekcha xabar bilan qaytaradi.
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  const initData = getWebApp()?.initData;
  if (initData) headers.set("x-telegram-init-data", initData);

  // FormData bo'lsa Content-Type'ni brauzer o'zi qo'yadi.
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    let message = "Xatolik yuz berdi";
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      /* JSON emas — standart xabar */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
