import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  restaurantName: z.string().trim().min(2).max(120),
  address: z.string().trim().max(255).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Sotuvchi bo'lish — restoran yaratadi va foydalanuvchi rolini yangilaydi.
// (Eski loyihadagi "sotuvchi bo'lib ro'yxatdan o'tishda API qulashi" tuzatildi.)
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Restoran nomi kamida 2 harf bo'lsin" },
        { status: 400 },
      );
    }
    const { restaurantName, address, latitude, longitude } = parsed.data;

    // Allaqachon restorani bormi?
    const existing = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (existing) {
      return Response.json({
        status: "success",
        restaurant: { id: existing.id, name: existing.name, status: existing.status },
      });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: user.id,
        name: restaurantName,
        address: address ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        status: "approved", // MVP: avtomatik tasdiqlanadi
      },
    });

    if (user.role !== "seller") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "seller" },
      });
    }

    return Response.json({
      status: "success",
      restaurant: { id: restaurant.id, name: restaurant.name, status: restaurant.status },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:register]", err);
    return Response.json({ error: "Ro'yxatdan o'tishda xatolik" }, { status: 500 });
  }
}
