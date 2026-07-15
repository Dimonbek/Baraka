"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ShoppingBag,
  Check,
  X,
  Phone,
  UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import { cn, formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface SellerOrder {
  id: number;
  dishName: string;
  dishImage: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  quantity: number;
  totalPrice: number;
  verificationCode: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  createdAt: string;
}

const STATUS: Record<SellerOrder["status"], { label: string; cls: string }> = {
  pending: { label: "Faol", cls: "bg-brand-50 text-brand-700" },
  completed: { label: "Yakunlandi", cls: "bg-brand-50 text-brand-700" },
  cancelled: { label: "Bekor", cls: "bg-danger/10 text-danger" },
  expired: { label: "Muddati o'tgan", cls: "bg-app text-faint" },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await api.get<SellerOrder[]>("/api/seller/orders"));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(order: SellerOrder, action: "complete" | "cancel") {
    setBusy(order.id);
    try {
      await api.post(`/api/seller/orders/${order.id}/${action}`);
      haptic.notify("success");
      toast.success(action === "complete" ? "Yakunlandi" : "Bekor qilindi");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: action === "complete" ? "completed" : "cancelled" }
            : o,
        ),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/seller"
          className="press flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Buyurtmalar
        </h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Hozircha buyurtma yo'q"
          description="Mijozlar taom bron qilganda shu yerda ko'rinadi."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-app">
                  {o.dishImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.dishImage}
                      alt={o.dishName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <UtensilsCrossed size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-bold text-ink">{o.dishName}</h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                        STATUS[o.status].cls,
                      )}
                    >
                      {STATUS[o.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {o.buyerName ?? "Mijoz"} · {o.quantity} dona ·{" "}
                    {formatPrice(o.totalPrice)} so&apos;m
                  </p>
                  {o.status === "pending" && (
                    <p className="mt-1 text-sm font-bold text-brand-700">
                      Kod: <span className="tracking-widest">{o.verificationCode}</span>
                    </p>
                  )}
                </div>
              </div>

              {o.status === "pending" && (
                <div className="flex divide-x divide-line border-t border-line">
                  {o.buyerPhone && (
                    <a
                      href={`tel:${o.buyerPhone}`}
                      className="press flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-muted"
                    >
                      <Phone size={15} />
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={busy === o.id}
                    onClick={() => act(o, "cancel")}
                    className="press flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-danger disabled:opacity-50"
                  >
                    <X size={16} /> Bekor
                  </button>
                  <button
                    type="button"
                    disabled={busy === o.id}
                    onClick={() => act(o, "complete")}
                    className="press flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-brand-600 disabled:opacity-50"
                  >
                    <Check size={16} /> Yakunlash
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
