"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Store, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface FavRestaurant {
  id: number;
  name: string;
  address: string | null;
  thumbnailUrl: string | null;
  activeDishes: number;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<FavRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.get<FavRestaurant[]>("/api/common/favorites"));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    haptic.impact("light");
    setItems((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.del(`/api/common/favorites/${id}`);
    } catch {
      load();
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Saralangan" subtitle="Yoqtirgan restoranlaringiz" />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Hali saralangan yo'q"
          description="Restoranlarni yurak belgisi bilan saqlang — shu yerda to'planadi."
        />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="card flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-brand-600">
                {r.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.thumbnailUrl}
                    alt={r.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={22} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold text-ink">{r.name}</h3>
                <p className="truncate text-xs text-muted">
                  {r.activeDishes > 0
                    ? `${r.activeDishes} ta faol taom`
                    : r.address || "Hozircha taom yo'q"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="press flex h-9 w-9 items-center justify-center rounded-full bg-app text-faint"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
