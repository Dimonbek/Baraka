"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Ban, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export function RestaurantRowActions({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(next: "approved" | "blocked") {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/restaurants/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next === "approved" ? "Tasdiqlandi" : "Bloklandi");
      router.refresh();
    } catch {
      toast.error("Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  if (status === "blocked") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => set("approved")}
        className="press flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-50"
      >
        <RotateCcw size={14} /> Tiklash
      </button>
    );
  }

  return (
    <div className="flex gap-1.5">
      {status === "pending" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => set("approved")}
          className="press flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-50"
        >
          <Check size={14} /> Tasdiqlash
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => set("blocked")}
        className="press flex items-center gap-1 rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs font-semibold text-danger disabled:opacity-50"
      >
        <Ban size={14} /> Bloklash
      </button>
    </div>
  );
}
