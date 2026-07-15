import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/admin-nav";

// Himoyalangan admin qatlami — sessiya bo'lmasa login'ga yo'naltiradi.
export default async function AdminDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-app">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
