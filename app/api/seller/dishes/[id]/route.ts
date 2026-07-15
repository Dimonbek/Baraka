import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  quantity: z.number().int().min(0).max(999).optional(),
  status: z.enum(["active", "hidden", "sold_out"]).optional(),
  discountPrice: z.number().positive().optional(),
});

// Taom egasi ekanini tekshiradi.
async function ownDish(userId: number, dishId: number) {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: { restaurant: { select: { ownerId: true } } },
  });
  if (!dish || dish.restaurant.ownerId !== userId) return null;
  return dish;
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const id = Number((await params).id);
    const dish = await ownDish(user.id, id);
    if (!dish) return Response.json({ error: "Taom topilmadi" }, { status: 404 });

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }
    const data = parsed.data;

    // Soni yangilansa, status'ni mos ravishda tuzatamiz.
    const updated = await prisma.dish.update({
      where: { id },
      data: {
        ...data,
        ...(data.quantity !== undefined && !data.status
          ? { status: data.quantity > 0 ? "active" : "sold_out" }
          : {}),
      },
    });
    return Response.json({ status: "success", quantity: updated.quantity });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:dish:patch]", err);
    return Response.json({ error: "Yangilanmadi" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser(req);
    const id = Number((await params).id);
    const dish = await ownDish(user.id, id);
    if (!dish) return Response.json({ error: "Taom topilmadi" }, { status: 404 });

    // Buyurtmalari bo'lsa o'chirmaymiz — yashiramiz (tarix saqlanadi).
    const orderCount = await prisma.order.count({ where: { dishId: id } });
    if (orderCount > 0) {
      await prisma.dish.update({ where: { id }, data: { status: "hidden" } });
    } else {
      await prisma.dish.delete({ where: { id } });
    }
    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:dish:delete]", err);
    return Response.json({ error: "O'chirilmadi" }, { status: 500 });
  }
}
