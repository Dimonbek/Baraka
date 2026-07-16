"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, UtensilsCrossed, SearchX, Zap, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import { CATEGORIES, type DishDTO } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DishCard } from "@/components/dish-card";
import { DishDetailSheet } from "@/components/dish-detail-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<DishDTO | null>(null);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  // Radius filtri (km). null = hammasi.
  const [radius, setRadius] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ active: boolean; text: string } | null>(
    null,
  );

  // Flash-sale banner (admin yoqadi)
  useEffect(() => {
    fetch("/api/flash-sale")
      .then((r) => r.json())
      .then(setFlash)
      .catch(() => {});
  }, []);

  // Joylashuvni olish (keshdan + jonli)
  useEffect(() => {
    const lat = localStorage.getItem("loc_lat");
    const lng = localStorage.getItem("loc_lng");
    if (lat && lng) setLoc({ lat: parseFloat(lat), lng: parseFloat(lng) });

    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const next = { lat: p.coords.latitude, lng: p.coords.longitude };
        setLoc(next);
        localStorage.setItem("loc_lat", String(next.lat));
        localStorage.setItem("loc_lng", String(next.lng));
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const path = loc
        ? `/api/buyer/dishes?lat=${loc.lat}&lng=${loc.lng}`
        : "/api/buyer/dishes";
      setDishes(await api.get<DishDTO[]>(path));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [loc]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes.filter((d) => {
      const catOk = category === "all" || d.category === category;
      const qOk =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.restaurantName.toLowerCase().includes(q);
      // Radius: masofasi bor va tanlangan radiusdan uzoq bo'lsa chiqarib tashlaymiz.
      // Masofasi noma'lum taomlar (sotuvchi joylashuv bermagan) doim ko'rinadi.
      const radOk =
        radius == null || d.distanceKm == null || d.distanceKm <= radius;
      return catOk && qOk && radOk;
    });
  }, [dishes, query, category, radius]);

  const RADII = [10, 50, 100] as const;

  async function toggleFavorite(dish: DishDTO) {
    haptic.impact("light");
    // Optimistik yangilash
    setDishes((prev) =>
      prev.map((d) =>
        d.restaurantId === dish.restaurantId
          ? { ...d, isFavorite: !d.isFavorite }
          : d,
      ),
    );
    try {
      if (dish.isFavorite) {
        await api.del(`/api/common/favorites/${dish.restaurantId}`);
      } else {
        await api.post(`/api/common/favorites/${dish.restaurantId}`);
        toast.success("Saralanganlarga qo'shildi");
      }
    } catch {
      // Xato bo'lsa qaytaramiz
      setDishes((prev) =>
        prev.map((d) =>
          d.restaurantId === dish.restaurantId
            ? { ...d, isFavorite: dish.isFavorite }
            : d,
        ),
      );
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Uvol Bo&apos;lmasin
        </h1>
        <p className="text-sm text-muted">Yaqin-atrofdagi chegirmali taomlar</p>
      </header>

      {/* Flash-sale banner */}
      {flash?.active && flash.text && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-accent-500/10 px-4 py-3 text-sm font-semibold text-accent-600">
          <Zap size={18} className="shrink-0 fill-accent-500 text-accent-500" />
          <span>{flash.text}</span>
        </div>
      )}

      {/* Qidiruv */}
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Taom yoki restoran qidiring..."
          className="w-full rounded-2xl border border-line bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Kategoriyalar */}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              haptic.select();
              setCategory(c.id);
            }}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === c.id
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-surface text-muted",
            )}
          >
            <span>{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* Radius filtri — faqat joylashuv bor bo'lsa */}
      {loc && (
        <div className="flex items-center gap-2">
          <MapPin size={15} className="shrink-0 text-brand-600" />
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                haptic.select();
                setRadius(null);
              }}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                radius == null
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-surface text-muted",
              )}
            >
              Hammasi
            </button>
            {RADII.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  haptic.select();
                  setRadius(r);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  radius === r
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line bg-surface text-muted",
                )}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ro'yxat */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-2xl" />
          ))}
        </div>
      ) : failed ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Hozircha taomlar yo'q"
          description="Ma'lumotlarni yuklab bo'lmadi yoki chegirmali taomlar tugagan."
          action={
            <button
              type="button"
              onClick={load}
              className="press rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Yangilash
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Taom topilmadi"
          description={
            query
              ? "Qidiruvga mos taom yo'q. Boshqa so'z bilan urinib ko'ring."
              : radius != null
                ? `${radius} km radiusda taom yo'q. Radiusni kengaytiring.`
                : "Bu turdagi chegirmali taomlar hozircha yo'q."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((dish, i) => (
            <DishCard
              key={dish.id}
              dish={dish}
              index={i}
              onClick={setSelected}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <DishDetailSheet
        dish={selected}
        onClose={() => setSelected(null)}
        onBooked={load}
      />
    </div>
  );
}
