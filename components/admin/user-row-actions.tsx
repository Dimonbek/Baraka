"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function UserRowActions({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const blocked = status === "blocked";

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: blocked ? "active" : "blocked" }),
      });
      if (!res.ok) throw new Error();
      toast.success(blocked ? "Blokdan chiqarildi" : "Bloklandi");
      router.refresh();
    } catch {
      toast.error("Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className={
        "press flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 " +
        (blocked
          ? "bg-brand-50 text-brand-700"
          : "bg-danger/10 text-danger")
      }
    >
      {blocked ? <CheckCircle2 size={14} /> : <Ban size={14} />}
      {blocked ? "Faollashtirish" : "Bloklash"}
    </button>
  );
}
