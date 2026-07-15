"use client";

import {
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
} from "lucide-react";
import type { OrderDTO } from "@/lib/types";
import { cn, formatPrice, formatCountdown } from "@/lib/utils";

const STATUS_META: Record<
  OrderDTO["status"],
  { label: string; className: string }
> = {
  pending: { label: "Kutilmoqda", className: "bg-brand-50 text-brand-700" },
  completed: { label: "Yakunlangan", className: "bg-brand-50 text-brand-700" },
  cancelled: { label: "Bekor qilingan", className: "bg-danger/10 text-danger" },
  expired: { label: "Muddati o'tgan", className: "bg-app text-faint" },
};

interface Props {
  order: OrderDTO;
  liveRemaining: number;
  onFeedback: (order: OrderDTO) => void;
}

export function OrderCard({ order, liveRemaining, onFeedback }: Props) {
  const meta = STATUS_META[order.status];
  const isActive = order.status === "pending" && liveRemaining > 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-app">
          {order.dishImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.dishImage}
              alt={order.dishName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-faint">
              <UtensilsCrossed size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-ink">{order.dishName}</h3>
              <p className="truncate text-xs text-muted">
                {order.restaurantName} · {order.quantity} dona
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                meta.className,
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm font-extrabold text-ink">
            {formatPrice(order.totalPrice)}{" "}
            <span className="text-xs font-semibold text-muted">so'm</span>
          </p>
        </div>
      </div>

      {/* Faol bron — kod + taymer */}
      {isActive && (
        <div className="border-t border-line bg-brand-50/50 px-3 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                Tasdiqlash kodi
              </p>
              <p className="text-2xl font-extrabold tracking-[0.2em] text-brand-700">
                {order.verificationCode}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-accent-600 shadow-sm">
              <Clock size={16} />
              {formatCountdown(liveRemaining)}
            </div>
          </div>
        </div>
      )}

      {/* Amallar */}
      <div className="flex divide-x divide-line border-t border-line">
        {order.sellerPhone && (
          <a
            href={`tel:${order.sellerPhone}`}
            className="press flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-muted"
          >
            <Phone size={15} /> Qo&apos;ng&apos;iroq
          </a>
        )}
        {order.status === "completed" && (
          <button
            type="button"
            onClick={() => onFeedback(order)}
            className="press flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-brand-600"
          >
            <MessageSquare size={15} /> Fikr bildirish
          </button>
        )}
        {order.status === "completed" && (
          <span className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-brand-600">
            <CheckCircle2 size={15} /> Olindi
          </span>
        )}
        {(order.status === "cancelled" || order.status === "expired") && (
          <span className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-faint">
            <XCircle size={15} /> {STATUS_META[order.status].label}
          </span>
        )}
      </div>
    </div>
  );
}
