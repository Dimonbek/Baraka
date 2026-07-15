import { checkAdminPassword, createAdminSession } from "@/lib/admin-auth";
import { z } from "zod";

const schema = z.object({ password: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json({ error: "Parol kiriting" }, { status: 400 });
    }
    if (!checkAdminPassword(parsed.data.password)) {
      return Response.json({ error: "Parol noto'g'ri" }, { status: 401 });
    }
    await createAdminSession();
    return Response.json({ status: "success" });
  } catch (err) {
    console.error("[admin:login]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
