import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBotMessage } from "@/lib/telegram";

type Ctx = { params: Promise<{ id: string }> };

// Sotuvchi buyurtmani bekor qiladi: soni tiklanadi + xaridorga xabar boradi.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const id = Number((await params).id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        dish: { include: { restaurant: { select: { ownerId: true, name: true } } } },
        buyer: { select: { telegramId: true } },
      },
    });
    if (!order || order.dish.restaurant.ownerId !== user.id) {
      return Response.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return Response.json(
        { error: "Faqat faol buyurtmani bekor qilish mumkin" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status: "cancelled" } }),
      prisma.dish.update({
        where: { id: order.dishId },
        data: {
          quantity: { increment: order.quantity },
          status: "active",
        },
      }),
    ]);

    // Xaridorga bildirishnoma
    if (order.buyer.telegramId) {
      await sendBotMessage(
        order.buyer.telegramId,
        `🚫 *Buyurtma bekor qilindi*\n\n` +
          `"${order.dish.name}" buyurtmangiz sotuvchi tomonidan bekor qilindi.\n` +
          `Sabab uchun "${order.dish.restaurant.name}" bilan bog'laning.`,
      );
    }
    await prisma.notification.create({
      data: {
        userId: order.buyerId,
        title: "Buyurtma bekor qilindi",
        message: `"${order.dish.name}" buyurtmangiz bekor qilindi.`,
        type: "order_status",
      },
    });

    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:order:cancel]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
