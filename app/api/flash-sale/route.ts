import { prisma } from "@/lib/db";

// Ochiq: joriy flash-sale banner holati (bosh sahifa o'qiydi).
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "flash_sale" },
    });
    if (!setting) return Response.json({ active: false, text: "" });
    return Response.json(JSON.parse(setting.value));
  } catch {
    return Response.json({ active: false, text: "" });
  }
}
