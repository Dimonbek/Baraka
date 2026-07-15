"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  CheckCircle2,
  UtensilsCrossed,
  ArrowRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { DishDTO } from "@/lib/types";
import { api, ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/utils";
import { haptic } from "@/lib/telegram-webapp";

const PICKUP_OPTIONS = [15, 30, 45, 60];

interface Props {
  dish: DishDTO | null;
  onClose: () => void;
  onBooked: () => void;
}

interface BookingResult {
  verificationCode: string;
  pickupTime: number;
}

export function DishDetailSheet({ dish, onClose, onBooked }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [pickupTime, setPickupTime] = useState(30);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setQuantity(1);
    setPickupTime(30);
    setBooking(null);
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleBook() {
    if (!dish) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ verificationCode: string }>(
        "/api/buyer/orders",
        { dishId: dish.id, quantity, pickupTime },
      );
      haptic.notify("success");
      setBooking({ verificationCode: res.verificationCode, pickupTime });
      onBooked();
    } catch (err) {
      haptic.notify("error");
      toast.error(err instanceof ApiError ? err.message : "Bron qilishda xatolik");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {dish && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-surface p-6 pb-safe"
          >
            {!booking ? (
              <>
                <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-line" />

                <div className="relative mb-5 h-44 w-full overflow-hidden rounded-2xl bg-app">
                  {dish.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <UtensilsCrossed size={40} />
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {dish.restaurantName}
                </p>
                <h2 className="text-xl font-extrabold text-ink">{dish.name}</h2>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-faint line-through">
                      {formatPrice(dish.originalPrice)} so'm
                    </span>
                    <span className="text-2xl font-extrabold text-ink">
                      {formatPrice(dish.discountPrice)}{" "}
                      <span className="text-sm font-semibold text-muted">so'm</span>
                    </span>
                  </div>

                  {/* Soni */}
                  <div className="flex items-center gap-3 rounded-2xl bg-app p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        haptic.select();
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      className="press flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-ink shadow-sm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center text-lg font-bold text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        haptic.select();
                        setQuantity((q) => Math.min(dish.quantity, q + 1));
                      }}
                      className="press flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Olib ketish vaqti */}
                <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
                  Necha daqiqada olib ketasiz?
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {PICKUP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        haptic.select();
                        setPickupTime(t);
                      }}
                      className={
                        "rounded-xl py-3 text-sm font-bold transition-colors " +
                        (pickupTime === t
                          ? "bg-brand-600 text-white"
                          : "bg-app text-muted")
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleBook}
                  className="press mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 font-bold text-white shadow-lg shadow-brand-600/20 disabled:opacity-60"
                >
                  {submitting ? "Bron qilinmoqda..." : "Bron qilish"}
                  {!submitting && <ArrowRight size={18} />}
                </button>
              </>
            ) : (
              /* Muvaffaqiyat */
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <CheckCircle2 size={38} />
                </div>
                <h2 className="text-xl font-extrabold text-ink">
                  Bron qabul qilindi!
                </h2>
                <p className="mt-1 text-sm text-muted">Tasdiqlash kodingiz:</p>
                <div className="my-5 rounded-2xl bg-app py-5">
                  <span className="text-4xl font-extrabold tracking-[0.3em] text-brand-600">
                    {booking.verificationCode}
                  </span>
                </div>
                <div className="mb-5 rounded-xl bg-accent-500/10 p-3 text-xs font-medium leading-relaxed text-accent-600">
                  Diqqat: bron faqat <b>{booking.pickupTime} daqiqa</b> amal qiladi.
                  Kodni sotuvchiga ko'rsating.
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 font-bold text-white"
                >
                  <X size={18} /> Yopish
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
