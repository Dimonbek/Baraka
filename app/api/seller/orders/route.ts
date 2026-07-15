import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Sotuvchi restoraniga tushgan buyurtmalar (yangi birinchi).
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) return Response.json([]);

    const orders = await prisma.order.findMany({
      where: { dish: { restaurantId: restaurant.id } },
      orderBy: { createdAt: "desc" },
      include: {
        dish: { select: { name: true, imageUrl: true } },
        buyer: { select: { fullName: true, phoneNumber: true } },
      },
      take: 100,
    });

    const now = Date.now();
    return Response.json(
      orders.map((o) => {
        const elapsed = (now - o.createdAt.getTime()) / 1000;
        const remaining = Math.max(0, (o.pickupTime ?? 30) * 60 - elapsed);
        return {
          id: o.id,
          dishName: o.dish.name,
          dishImage: o.dish.imageUrl,
          buyerName: o.buyer.fullName,
          buyerPhone: o.buyer.phoneNumber,
          quantity: o.quantity,
          totalPrice: Number(o.totalPrice),
          verificationCode: o.verificationCode,
          status: o.status,
          remainingSeconds: Math.floor(remaining),
          createdAt: o.createdAt.toISOString(),
        };
      }),
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:orders]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
