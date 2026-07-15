"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  ChevronRight,
  Minus,
  EyeOff,
  MapPin,
  LocateFixed,
  Loader2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import { requestLocation } from "@/lib/location";
import type { ProfileDTO } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AddDishSheet } from "@/components/seller/add-dish-sheet";

interface Analytics {
  totalDishes: number;
  totalOrders: number;
  totalRevenue: number;
  activeDishes: number;
}
interface SellerDish {
  id: number;
  name: string;
  imageUrl: string | null;
  discountPrice: number;
  quantity: number;
  status: string;
}

export default function SellerPage() {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dishes, setDishes] = useState<SellerDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [registering, setRegistering] = useState(false);
  // Ro'yxatdan o'tishda tanlangan joylashuv
  const [regLoc, setRegLoc] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locBusy, setLocBusy] = useState(false);

  const loadDashboard = useCallback(async () => {
    const [a, d] = await Promise.all([
      api.get<Analytics>("/api/seller/analytics"),
      api.get<SellerDish[]>("/api/seller/dishes"),
    ]);
    setAnalytics(a);
    setDishes(d);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.get<ProfileDTO>("/api/common/profile");
      setProfile(p);
      if (p.isSeller) await loadDashboard();
    } catch {
      /* profil yuklanmadi */
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  useEffect(() => {
    load();
  }, [load]);

  // Ro'yxatdan o'tishda joylashuvni olish
  async function shareRegLocation() {
    setLocBusy(true);
    try {
      const l = await requestLocation();
      setRegLoc(l);
      haptic.notify("success");
      toast.success("Joylashuv olindi");
    } catch {
      toast.error("Joylashuvga ruxsat bering yoki qayta urinib ko'ring");
    } finally {
      setLocBusy(false);
    }
  }

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setRegistering(true);
    try {
      await api.post("/api/seller/register", {
        restaurantName: String(form.get("restaurantName") ?? ""),
        address: String(form.get("address") ?? ""),
        ...(regLoc ? { latitude: regLoc.lat, longitude: regLoc.lng } : {}),
      });
      haptic.notify("success");
      toast.success("Tabriklaymiz! Endi taom qo'sha olasiz");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Xatolik");
    } finally {
      setRegistering(false);
    }
  }

  // Dashboard: restoran joylashuvini belgilash/yangilash
  async function updateLocation() {
    setLocBusy(true);
    try {
      const l = await requestLocation();
      await api.patch("/api/seller/restaurant", {
        latitude: l.lat,
        longitude: l.lng,
      });
      haptic.notify("success");
      toast.success("Joylashuv saqlandi");
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Joylashuvga ruxsat bering yoki qayta urinib ko'ring",
      );
    } finally {
      setLocBusy(false);
    }
  }

  async function changeQty(dish: SellerDish, delta: number) {
    const next = Math.max(0, dish.quantity + delta);
    haptic.select();
    setDishes((prev) =>
      prev.map((d) => (d.id === dish.id ? { ...d, quantity: next } : d)),
    );
    try {
      await api.patch(`/api/seller/dishes/${dish.id}`, { quantity: next });
    } catch {
      load();
    }
  }

  async function hideDish(dish: SellerDish) {
    haptic.impact("light");
    try {
      await api.del(`/api/seller/dishes/${dish.id}`);
      toast.success("Taom olib tashlandi");
      setDishes((prev) => prev.filter((d) => d.id !== dish.id));
      loadDashboard();
    } catch {
      toast.error("O'chirilmadi");
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Sotuvchi kabineti" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  // ── Sotuvchi emas: ro'yxatdan o'tish ──
  if (!profile?.isSeller) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sotuvchi bo'lish" />
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Store size={26} />
          </div>
          <h2 className="text-lg font-bold text-ink">Restoraningizni oching</h2>
          <p className="text-sm text-muted">
            Qolgan taomlarni chegirmada soting — isrofni kamaytiring, qo&apos;shimcha
            daromad qiling.
          </p>
        </div>
        <form onSubmit={register} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Restoran nomi
            </span>
            <input
              name="restaurantName"
              required
              placeholder="Masalan: Osh Markazi"
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Manzil (ixtiyoriy)
            </span>
            <input
              name="address"
              placeholder="Chilonzor, Toshkent"
              className="input"
            />
          </label>

          {/* Joylashuv — xaridorlarga masofa/radius bo'yicha ko'rsatish uchun */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted">
              Joylashuv
            </span>
            <button
              type="button"
              onClick={shareRegLocation}
              disabled={locBusy}
              className={
                "press flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold disabled:opacity-60 " +
                (regLoc
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-line bg-surface text-ink")
              }
            >
              {locBusy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : regLoc ? (
                <Check size={16} />
              ) : (
                <LocateFixed size={16} />
              )}
              {regLoc ? "Joylashuv olindi" : "Joylashuvni ulashish"}
            </button>
            <p className="mt-1.5 text-[11px] text-faint">
              Xaridorlar sizni yaqin-atrofdan (masofa bo&apos;yicha) topishi uchun.
            </p>
          </div>

          <button
            type="submit"
            disabled={registering}
            className="press w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white disabled:opacity-60"
          >
            {registering ? "Yaratilmoqda..." : "Restoranni yaratish"}
          </button>
        </form>
      </div>
    );
  }

  // ── Sotuvchi dashboard ──
  return (
    <div className="space-y-5">
      <PageHeader
        title={profile.restaurant?.name ?? "Kabinet"}
        subtitle="Sotuvchi paneli"
        action={
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/25"
          >
            <Plus size={22} />
          </button>
        }
      />

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-3">
        <Stat
          icon={TrendingUp}
          label="Daromad"
          value={formatPrice(analytics?.totalRevenue ?? 0)}
        />
        <Stat
          icon={ShoppingBag}
          label="Buyurtma"
          value={String(analytics?.totalOrders ?? 0)}
        />
        <Stat
          icon={UtensilsCrossed}
          label="Faol taom"
          value={String(analytics?.activeDishes ?? 0)}
        />
      </div>

      {/* Joylashuv holati */}
      {(() => {
        const hasLoc =
          profile.restaurant?.latitude != null &&
          profile.restaurant?.longitude != null;
        return (
          <div
            className={
              "card flex items-center gap-3 p-4 " +
              (hasLoc ? "" : "border-accent-500/40 bg-accent-500/5")
            }
          >
            <div
              className={
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
                (hasLoc
                  ? "bg-brand-50 text-brand-600"
                  : "bg-accent-500/15 text-accent-600")
              }
            >
              <MapPin size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">Joylashuv</p>
              <p className="text-sm text-muted">
                {hasLoc
                  ? "Belgilangan — xaridorlar sizni yaqindan topadi"
                  : "Belgilanmagan — xaridorlar masofani ko'rmaydi"}
              </p>
            </div>
            <button
              type="button"
              onClick={updateLocation}
              disabled={locBusy}
              className={
                "press flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-60 " +
                (hasLoc
                  ? "bg-app text-ink"
                  : "bg-brand-600 text-white")
              }
            >
              {locBusy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <LocateFixed size={15} />
              )}
              {hasLoc ? "Yangilash" : "Belgilash"}
            </button>
          </div>
        );
      })()}

      <Link
        href="/seller/orders"
        className="press card flex items-center gap-3 p-4"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ShoppingBag size={20} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-ink">Buyurtmalar</p>
          <p className="text-sm text-muted">Kelgan buyurtmalarni boshqaring</p>
        </div>
        <ChevronRight size={20} className="text-faint" />
      </Link>

      {/* Taomlar */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-ink">Mening taomlarim</h2>
        {dishes.length === 0 ? (
          <div className="card p-6 text-center text-sm text-muted">
            Hali taom qo&apos;shmagansiz. Yuqoridagi + tugmasini bosing.
          </div>
        ) : (
          <div className="space-y-3">
            {dishes.map((d) => (
              <div key={d.id} className="card flex items-center gap-3 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-app">
                  {d.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.imageUrl}
                      alt={d.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-faint">
                      <UtensilsCrossed size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-ink">{d.name}</h3>
                    {d.status !== "active" && (
                      <span className="rounded bg-app px-1.5 py-0.5 text-[10px] font-bold text-faint">
                        {d.status === "sold_out" ? "Tugagan" : "Yashirin"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-700">
                    {formatPrice(d.discountPrice)}{" "}
                    <span className="text-xs font-medium text-muted">so&apos;m</span>
                  </p>
                </div>
                {/* Soni boshqaruvi */}
                <div className="flex items-center gap-2 rounded-xl bg-app p-1">
                  <button
                    type="button"
                    onClick={() => changeQty(d, -1)}
                    className="press flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-ink shadow-sm"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-ink">
                    {d.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(d, 1)}
                    className="press flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => hideDish(d)}
                  className="press flex h-8 w-8 items-center justify-center rounded-full text-faint"
                >
                  <EyeOff size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddDishSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={loadDashboard}
      />
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("card flex flex-col gap-1 p-3")}>
      <Icon size={18} className="text-brand-600" />
      <span className="truncate text-base font-extrabold text-ink">{value}</span>
      <span className="text-[11px] font-medium text-muted">{label}</span>
    </div>
  );
}
