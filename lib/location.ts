"use client";

/**
 * Brauzer geolokatsiyasidan joriy koordinatani so'raydi.
 * Telegram Mini App webview'ida ham ishlaydi (foydalanuvchi ruxsat bersa).
 */
export function requestLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Qurilma joylashuvni qo'llab-quvvatlamaydi"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}
