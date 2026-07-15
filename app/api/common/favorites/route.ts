import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Foydalanuvchining saralangan restoranlari (faol taomlari soni bilan).
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: {
          include: {
            _count: {
              select: { dishes: { where: { status: "active", quantity: { gt: 0 } } } },
            },
          },
        },
      },
    });

    return Response.json(
      favorites.map((f) => ({
        id: f.restaurant.id,
        name: f.restaurant.name,
        address: f.restaurant.address,
        thumbnailUrl: f.restaurant.thumbnailUrl,
        activeDishes: f.restaurant._count.dishes,
      })),
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[favorites:list]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
