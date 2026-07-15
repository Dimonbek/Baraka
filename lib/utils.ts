import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class'larni xavfsiz birlashtirish (shartli + konflikt yechish). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Narxni o'zbekcha formatda ko'rsatish: 25000 -> "25 000". */
export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "0";
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Chegirma foizini hisoblash. */
export function discountPercent(original: number, discounted: number): number {
  if (!original || original <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

/** Soniyalarni "MM:SS" ko'rinishiga aylantiradi. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
