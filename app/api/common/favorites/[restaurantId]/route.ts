import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ restaurantId: string }> };

// Saralanganlarga qo'shish
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const restaurantId = Number((await params).restaurantId);
    if (!Number.isFinite(restaurantId)) {
      return Response.json({ error: "Noto'g'ri restoran" }, { status: 400 });
    }

    await prisma.favorite.upsert({
      where: { userId_restaurantId: { userId: user.id, restaurantId } },
      update: {},
      create: { userId: user.id, restaurantId },
    });
    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[favorites:add]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

// Saralanganlardan olib tashlash
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const restaurantId = Number((await params).restaurantId);

    await prisma.favorite.deleteMany({
      where: { userId: user.id, restaurantId },
    });
    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[favorites:remove]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
