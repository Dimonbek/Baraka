"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import type { OrderDTO } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderCard } from "@/components/order-card";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedAt = useRef(Date.now());
  const [, setTick] = useState(0);
  const [feedbackOrder, setFeedbackOrder] = useState<OrderDTO | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<OrderDTO[]>("/api/buyer/orders");
      fetchedAt.current = Date.now();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Har soniyada taymerlarni yangilash
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function liveRemaining(order: OrderDTO): number {
    const elapsed = (Date.now() - fetchedAt.current) / 1000;
    return Math.max(0, order.remainingSeconds - elapsed);
  }

  async function submitFeedback() {
    if (!feedbackOrder || !feedbackText.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/buyer/orders/${feedbackOrder.id}/feedback`, {
        feedback: feedbackText.trim(),
      });
      haptic.notify("success");
      toast.success("Fikringiz sotuvchiga yuborildi");
      setFeedbackOrder(null);
      setFeedbackText("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuborilmadi");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Buyurtmalar" subtitle="Bron va tasdiqlash kodlaringiz" />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Hozircha buyurtma yo'q"
          description="Bosh sahifadan taom bron qiling — bu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              liveRemaining={liveRemaining(o)}
              onFeedback={setFeedbackOrder}
            />
          ))}
        </div>
      )}

      {/* Feedback oynasi */}
      <AnimatePresence>
        {feedbackOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFeedbackOrder(null)}
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Fikr bildirish</h2>
                <button
                  type="button"
                  onClick={() => setFeedbackOrder(null)}
                  className="press flex h-8 w-8 items-center justify-center rounded-full bg-app text-muted"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="mb-3 text-sm text-muted">
                &quot;{feedbackOrder.dishName}&quot; haqidagi fikringiz sotuvchiga
                yetkaziladi.
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                placeholder="Taom qanday edi? Yaxshilanishi kerak bo'lgan narsa bormi?"
                className="w-full resize-none rounded-2xl border border-line bg-app p-3 text-sm text-ink placeholder:text-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                disabled={sending || !feedbackText.trim()}
                onClick={submitFeedback}
                className="press mt-4 w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white disabled:opacity-50"
              >
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
