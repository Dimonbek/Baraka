import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/blob";

// Sotuvchining barcha taomlari (faol birinchi, so'ng yangi).
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) return Response.json([]);

    const dishes = await prisma.dish.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return Response.json(
      dishes.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        imageUrl: d.imageUrl,
        originalPrice: Number(d.originalPrice),
        discountPrice: Number(d.discountPrice),
        quantity: d.quantity,
        status: d.status,
        pickupStart: d.pickupStart,
        pickupEnd: d.pickupEnd,
      })),
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:dishes:list]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

// Yangi taom qo'shish (multipart/form-data, rasm bilan).
export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const form = await req.formData();

    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "Milliy taomlar");
    const originalPrice = Number(form.get("originalPrice"));
    const discountPrice = Number(form.get("discountPrice"));
    const quantity = Number(form.get("quantity") ?? 1);
    const pickupStart = String(form.get("pickupStart") ?? "18:00");
    const pickupEnd = String(form.get("pickupEnd") ?? "21:30");
    // Yangi oqim: sotuvchi nom bo'yicha taklif etilgan rasmdan birini tanlaydi
    // (imageUrl). Eski oqim (fayl yuklash) ham qo'llab-quvvatlanadi (image).
    const pickedUrl = String(form.get("imageUrl") ?? "").trim();
    const image = form.get("image");

    if (!name || !Number.isFinite(originalPrice) || !Number.isFinite(discountPrice)) {
      return Response.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }
    if (discountPrice >= originalPrice) {
      return Response.json(
        { error: "Chegirma narxi asl narxdan past bo'lsin" },
        { status: 400 },
      );
    }

    // Restoran bor bo'lmasa avtomatik yaratamiz (sotuvchi rolini beramiz).
    let restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          ownerId: user.id,
          name: `${user.fullName ?? "Mening"} oshxonam`,
          status: "approved",
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "seller" },
      });
    }

    // Ruxsat etilgan rasm manbalari: lokal taklif (/food/...),
    // Vercel Blob (yuklangan), yoki Unsplash (eski).
    const allowedUrl =
      pickedUrl.startsWith("/food/") ||
      pickedUrl.includes(".public.blob.vercel-storage.com") ||
      pickedUrl.startsWith("https://images.unsplash.com/") ||
      pickedUrl.startsWith("https://upload.wikimedia.org/");
    let imageUrl: string | null = allowedUrl ? pickedUrl : null;
    // Sotuvchi o'z rasmini yuklagan bo'lsa — Vercel Blob'ga saqlaymiz.
    if (!imageUrl && image instanceof File && image.size > 0) {
      imageUrl = await uploadImage(image, "dish");
    }

    const dish = await prisma.dish.create({
      data: {
        restaurantId: restaurant.id,
        name,
        category,
        originalPrice,
        discountPrice,
        quantity: Number.isFinite(quantity) ? quantity : 1,
        imageUrl,
        pickupStart,
        pickupEnd,
        status: "active",
      },
    });

    return Response.json({ status: "success", id: dish.id });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:dishes:create]", err);
    return Response.json({ error: "Taom qo'shilmadi" }, { status: 500 });
  }
}
