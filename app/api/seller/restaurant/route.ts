import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  address: z.string().trim().max(255).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Sotuvchi restoranini yangilash (joylashuv, nom, manzil).
export async function PATCH(req: Request) {
  try {
    const user = await requireUser(req);
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      return Response.json({ error: "Restoran topilmadi" }, { status: 404 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
    }

    const { name, address, latitude, longitude } = parsed.data;
    // lat/lng har doim juft kelishi kerak.
    if ((latitude == null) !== (longitude == null)) {
      return Response.json(
        { error: "Joylashuv to'liq emas" },
        { status: 400 },
      );
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(latitude != null ? { latitude } : {}),
        ...(longitude != null ? { longitude } : {}),
      },
    });

    return Response.json({
      status: "success",
      restaurant: {
        id: updated.id,
        name: updated.name,
        status: updated.status,
        address: updated.address,
        latitude: updated.latitude != null ? Number(updated.latitude) : null,
        longitude: updated.longitude != null ? Number(updated.longitude) : null,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:restaurant:patch]", err);
    return Response.json({ error: "Yangilanmadi" }, { status: 500 });
  }
}
