import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["pending", "approved", "blocked"]) });

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const id = Number((await params).id);
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  // Restoran bloklansa, taomlari ham yashiriladi.
  await prisma.$transaction([
    prisma.restaurant.update({
      where: { id },
      data: { status: parsed.data.status },
    }),
    ...(parsed.data.status === "blocked"
      ? [
          prisma.dish.updateMany({
            where: { restaurantId: id },
            data: { status: "hidden" },
          }),
        ]
      : []),
  ]);
  return Response.json({ status: "success" });
}
