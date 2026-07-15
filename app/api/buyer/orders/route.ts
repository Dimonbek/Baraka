import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bodySchema = z.object({
  dishId: z.number().int().positive(),
  quantity: z.number().int().positive().max(20).default(1),
  pickupTime: z.number().int().positive().max(180).default(30),
});

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Joriy foydalanuvchi buyurtmalari — taymer va lazy expiry bilan.
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const orders = await prisma.order.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        dish: {
          include: {
            restaurant: { include: { owner: { select: { phoneNumber: true } } } },
          },
        },
      },
    });

    const now = Date.now();
    const result = [];
    const toExpire: number[] = [];

    for (const o of orders) {
      const elapsed = (now - o.createdAt.getTime()) / 1000;
      const remaining = Math.max(0, (o.pickupTime ?? 30) * 60 - elapsed);
      let status = o.status;
      if (remaining <= 0 && status === "pending") {
        status = "expired";
        toExpire.push(o.id);
      }
      result.push({
        id: o.id,
        dishId: o.dishId,
        dishName: o.dish.name,
        dishImage: o.dish.imageUrl,
        restaurantName: o.dish.restaurant.name,
        quantity: o.quantity,
        totalPrice: Number(o.totalPrice),
        verificationCode: status === "pending" ? o.verificationCode : "—",
        sellerPhone: o.dish.restaurant.owner.phoneNumber,
        status,
        remainingSeconds: Math.floor(remaining),
        createdAt: o.createdAt.toISOString(),
      });
    }

    if (toExpire.length) {
      await prisma.order.updateMany({
        where: { id: { in: toExpire } },
        data: { status: "expired" },
      });
    }

    return Response.json(result);
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[orders:list]", err);
    return Response.json({ error: "Buyurtmalarni yuklab bo'lmadi" }, { status: 500 });
  }
}

// Buyurtma (bron) yaratish — kod generatsiya qilinadi, taom soni kamayadi.
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }
    const { dishId, quantity, pickupTime } = parsed.data;

    // Tranzaksiya: soni yetarliligini tekshirib, kamaytirib, buyurtma yaratamiz.
    const result = await prisma.$transaction(async (tx) => {
      const dish = await tx.dish.findUnique({ where: { id: dishId } });
      if (!dish) throw new Response(
        JSON.stringify({ error: "Taom topilmadi" }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
      if (dish.quantity < quantity) throw new Response(
        JSON.stringify({ error: "Bunday miqdorda taom qolmagan" }),
        { status: 400, headers: { "content-type": "application/json" } },
      );

      const newQty = dish.quantity - quantity;
      await tx.dish.update({
        where: { id: dishId },
        data: {
          quantity: newQty,
          status: newQty <= 0 ? "sold_out" : dish.status,
        },
      });

      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          dishId: dish.id,
          quantity,
          pickupTime,
          totalPrice: Number(dish.discountPrice) * quantity,
          verificationCode: genCode(),
          status: "pending",
        },
      });
      return order;
    });

    return Response.json({
      status: "success",
      orderId: result.id,
      verificationCode: result.verificationCode,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[orders:create]", err);
    return Response.json({ error: "Buyurtma berilmadi" }, { status: 500 });
  }
}
