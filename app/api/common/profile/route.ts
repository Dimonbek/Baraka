import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Joriy foydalanuvchi profili + sotuvchi holati.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        status: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    return Response.json({
      id: user.id,
      telegramId: user.telegramId.toString(),
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isSeller: Boolean(restaurant),
      restaurant: restaurant
        ? {
            id: restaurant.id,
            name: restaurant.name,
            status: restaurant.status,
            address: restaurant.address,
            latitude:
              restaurant.latitude != null ? Number(restaurant.latitude) : null,
            longitude:
              restaurant.longitude != null
                ? Number(restaurant.longitude)
                : null,
          }
        : null,
    });
  } catch (err) {
    // requireUser 401 Response tashlashi mumkin
    if (err instanceof Response) return err;
    console.error("[profile]", err);
    return Response.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 },
    );
  }
}
