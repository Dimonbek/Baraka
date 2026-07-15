import { prisma } from "@/lib/db";
import { RestaurantRowActions } from "@/components/admin/restaurant-row-actions";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Kutilmoqda", cls: "bg-accent-500/10 text-accent-600" },
  approved: { label: "Tasdiqlangan", cls: "bg-brand-50 text-brand-700" },
  blocked: { label: "Bloklangan", cls: "bg-danger/10 text-danger" },
};

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { fullName: true, phoneNumber: true } },
      _count: { select: { dishes: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">
        Restoranlar{" "}
        <span className="text-base font-semibold text-muted">
          ({restaurants.length})
        </span>
      </h1>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {restaurants.map((r) => {
            const s = STATUS[r.status] ?? STATUS.pending;
            return (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{r.name}</p>
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-[10px] font-bold " + s.cls
                      }
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted">
                    {r.owner.fullName ?? "—"} · {r._count.dishes} taom
                  </p>
                </div>
                <RestaurantRowActions id={r.id} status={r.status} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
