import { prisma } from "@/lib/db";
import { UserRowActions } from "@/components/admin/user-row-actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  buyer: "Xaridor",
  seller: "Sotuvchi",
  admin: "Admin",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">
        Foydalanuvchilar{" "}
        <span className="text-base font-semibold text-muted">
          ({users.length})
        </span>
      </h1>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-ink">
                    {u.fullName ?? "—"}
                  </p>
                  <span className="rounded bg-app px-1.5 py-0.5 text-[10px] font-bold text-muted">
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                  {u.status === "blocked" && (
                    <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold text-danger">
                      Bloklangan
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted">
                  {u.phoneNumber ?? "raqam yo'q"}
                </p>
              </div>
              {u.role !== "admin" && (
                <UserRowActions id={u.id} status={u.status} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
