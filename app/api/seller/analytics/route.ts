import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Sotuvchi statistikasi: taomlar, buyurtmalar, daromad, faol taomlar.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      return Response.json({
        totalDishes: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeDishes: 0,
      });
    }

    const dishIds = (
      await prisma.dish.findMany({
        where: { restaurantId: restaurant.id },
        select: { id: true },
      })
    ).map((d) => d.id);

    const [totalDishes, activeDishes, totalOrders, revenue] = await Promise.all([
      prisma.dish.count({ where: { restaurantId: restaurant.id } }),
      prisma.dish.count({
        where: { restaurantId: restaurant.id, status: "active" },
      }),
      prisma.order.count({ where: { dishId: { in: dishIds } } }),
      prisma.order.aggregate({
        where: { dishId: { in: dishIds }, status: "completed" },
        _sum: { totalPrice: true },
      }),
    ]);

    return Response.json({
      totalDishes,
      activeDishes,
      totalOrders,
      totalRevenue: Number(revenue._sum.totalPrice ?? 0),
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:analytics]", err);
    return Response.json(
      { totalDishes: 0, totalOrders: 0, totalRevenue: 0, activeDishes: 0 },
      { status: 200 },
    );
  }
}
