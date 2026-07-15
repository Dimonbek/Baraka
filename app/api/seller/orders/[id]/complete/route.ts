import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// Buyurtmani "yakunlandi" deb belgilash (kod bo'yicha topshirilgach).
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const id = Number((await params).id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: { dish: { include: { restaurant: { select: { ownerId: true } } } } },
    });
    if (!order || order.dish.restaurant.ownerId !== user.id) {
      return Response.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    }
    if (order.status !== "pending") {
      return Response.json(
        { error: "Bu buyurtma allaqachon yakunlangan yoki bekor qilingan" },
        { status: 400 },
      );
    }

    await prisma.order.update({ where: { id }, data: { status: "completed" } });
    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:order:complete]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
