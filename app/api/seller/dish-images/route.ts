import { requireUser } from "@/lib/auth";
import { suggestImages } from "@/lib/food-images";

// Taom nomi bo'yicha rasm takliflari: GET /api/seller/dish-images?q=osh&category=...
export async function GET(req: Request) {
  try {
    await requireUser(req);
    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const category = url.searchParams.get("category");
    return Response.json({ images: suggestImages(q, category) });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[seller:dish-images]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
