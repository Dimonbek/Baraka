import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { haversineKm } from "@/lib/geo";
import type { DishDTO } from "@/lib/types";

// Faol chegirmali taomlar ro'yxati. Ixtiyoriy ?lat=&lng= — masofa hisoblanadi.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const hasLoc = Number.isFinite(lat) && Number.isFinite(lng);

    const dishes = await prisma.dish.findMany({
      where: { status: "active", quantity: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: {
          select: { id: true, name: true, latitude: true, longitude: true },
        },
      },
    });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { restaurantId: true },
    });
    const favIds = new Set(favorites.map((f) => f.restaurantId));

    const result: DishDTO[] = dishes.map((d) => {
      let distanceKm: number | null = null;
      if (hasLoc && d.restaurant.latitude && d.restaurant.longitude) {
        distanceKm =
          Math.round(
            haversineKm(
              lat,
              lng,
              Number(d.restaurant.latitude),
              Number(d.restaurant.longitude),
            ) * 10,
          ) / 10;
      }
      return {
        id: d.id,
        name: d.name,
        category: d.category,
        restaurantId: d.restaurantId,
        restaurantName: d.restaurant.name,
        imageUrl: d.imageUrl,
        originalPrice: Number(d.originalPrice),
        discountPrice: Number(d.discountPrice),
        quantity: d.quantity,
        pickupEnd: d.pickupEnd,
        isFavorite: favIds.has(d.restaurantId),
        distanceKm,
      };
    });

    // Masofa bo'yicha saralash (agar joylashuv bor bo'lsa)
    if (hasLoc) {
      result.sort(
        (a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999),
      );
    }

    return Response.json(result);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[dishes]", err);
    return Response.json({ error: "Taomlarni yuklab bo'lmadi" }, { status: 500 });
  }
}
