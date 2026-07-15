import {
  Users,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Leaf,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { FlashSaleToggle } from "@/components/admin/flash-sale-toggle";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    users,
    sellers,
    restaurants,
    pendingRestaurants,
    dishes,
    activeDishes,
    orders,
    completed,
    revenueAgg,
    rescuedAgg,
    flash,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "seller" } }),
    prisma.restaurant.count(),
    prisma.restaurant.count({ where: { status: "pending" } }),
    prisma.dish.count(),
    prisma.dish.count({ where: { status: "active" } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "completed" } }),
    prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { totalPrice: true },
    }),
    prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { quantity: true },
    }),
    prisma.setting.findUnique({ where: { key: "flash_sale" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        dish: { select: { name: true } },
        buyer: { select: { fullName: true } },
      },
    }),
  ]);

  const revenue = Number(revenueAgg._sum.totalPrice ?? 0);
  const rescued = rescuedAgg._sum.quantity ?? 0;
  const flashData = flash
    ? (JSON.parse(flash.value) as { active: boolean; text: string })
    : { active: false, text: "" };

  const stats = [
    { icon: Leaf, label: "Qutqarilgan taom", value: String(rescued), accent: true },
    { icon: TrendingUp, label: "Daromad (so'm)", value: formatPrice(revenue) },
    { icon: ShoppingBag, label: "Buyurtmalar", value: `${completed}/${orders}` },
    { icon: Users, label: "Foydalanuvchi", value: String(users) },
    { icon: Store, label: "Restoran", value: String(restaurants) },
    { icon: UtensilsCrossed, label: "Faol taom", value: `${activeDishes}/${dishes}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Boshqaruv paneli
        </h1>
        <p className="text-sm text-muted">
          {sellers} sotuvchi · {pendingRestaurants} tasdiqlanmagan restoran
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={
              "card flex flex-col gap-2 p-4 " +
              (s.accent ? "bg-brand-50/60" : "")
            }
          >
            <s.icon
              size={20}
              className={s.accent ? "text-brand-600" : "text-muted"}
            />
            <span className="text-xl font-extrabold text-ink">{s.value}</span>
            <span className="text-xs font-medium text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <FlashSaleToggle
        initialActive={flashData.active}
        initialText={flashData.text}
      />

      {/* So'nggi buyurtmalar */}
      <div className="card overflow-hidden">
        <h3 className="border-b border-line px-5 py-3 font-bold text-ink">
          So&apos;nggi buyurtmalar
        </h3>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted">
            Hozircha buyurtma yo&apos;q
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {o.dish.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {o.buyer.fullName ?? "Mijoz"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-ink">
                    {formatPrice(Number(o.totalPrice))}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-brand-50 text-brand-700",
    completed: "bg-brand-50 text-brand-700",
    cancelled: "bg-danger/10 text-danger",
    expired: "bg-app text-faint",
  };
  const label: Record<string, string> = {
    pending: "Faol",
    completed: "Yakunlandi",
    cancelled: "Bekor",
    expired: "O'tgan",
  };
  return (
    <span
      className={
        "rounded-full px-2 py-0.5 text-[10px] font-bold " +
        (map[status] ?? "bg-app text-faint")
      }
    >
      {label[status] ?? status}
    </span>
  );
}
