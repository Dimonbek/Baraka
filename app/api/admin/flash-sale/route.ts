import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  active: z.boolean(),
  text: z.string().max(160).default(""),
});

// Flash-sale bannerini yoqish/o'chirish (bosh sahifada ko'rinadi).
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });
  }
  await prisma.setting.upsert({
    where: { key: "flash_sale" },
    update: { value: JSON.stringify(parsed.data) },
    create: { key: "flash_sale", value: JSON.stringify(parsed.data) },
  });
  return Response.json({ status: "success" });
}
