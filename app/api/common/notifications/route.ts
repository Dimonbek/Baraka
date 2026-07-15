import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Foydalanuvchi bildirishnomalari (eski loyihada yetishmayotgan endpoint).
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json(
      notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[notifications:list]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

// Barcha bildirishnomalarni o'qilgan deb belgilash.
export async function PATCH(req: Request) {
  try {
    const user = await requireUser(req);
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
    return Response.json({ status: "success" });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[notifications:read]", err);
    return Response.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
