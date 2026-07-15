import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBotMessage } from "@/lib/telegram";
import { z } from "zod";

type Ctx = { params: Promise<{ orderId: string }> };

const schema = z.object({ feedback: z.string().trim().min(1).max(1000) });

// Buyurtmaga fikr-mulohaza — sotuvchiga Telegram orqali yetkaziladi.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const orderId = Number((await params).orderId);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Fikr bo'sh bo'lmasin" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: user.id },
      include: { dish: { include: { restaurant: { include: { owner: true } } } } },
    });
    if (!order) {
      return Response.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }

    const seller = order.dish.restaurant.owner;
    if (seller?.telegramId) {
      const text =
        `🍱 *Yangi fikr-mulohaza*\n\n` +
        `Taom: ${order.dish.name}\n` +
        `Foydalanuvchi: ${user.fullName ?? "—"}\n` +
        `📞 Raqami: ${user.phoneNumber ?? "—"}\n` +
        `💬 Fikr: ${parsed.data.feedback}`;
      await sendBotMessage(seller.telegramId, text);

      await prisma.notification.create({
        data: {
          userId: seller.id,
          title: "Yangi fikr-mulohaza",
          message: `${order.dish.name}: ${parsed.data.feedback}`,
          type: "feedback",
        },
      });
    }

    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[feedback]", err);
    return Response.json({ error: "Fikr yuborilmadi" }, { status: 500 });
  }
}
