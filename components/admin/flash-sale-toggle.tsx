"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";

export function FlashSaleToggle({
  initialActive,
  initialText,
}: {
  initialActive: boolean;
  initialText: string;
}) {
  const [active, setActive] = useState(initialActive);
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);

  async function save(nextActive: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flash-sale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: nextActive, text }),
      });
      if (!res.ok) throw new Error();
      setActive(nextActive);
      toast.success(nextActive ? "Flash-sale yoqildi" : "Flash-sale o'chirildi");
    } catch {
      toast.error("Saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
          <Zap size={18} />
        </div>
        <div>
          <h3 className="font-bold text-ink">Flash-sale banner</h3>
          <p className="text-xs text-muted">Bosh sahifada e&apos;lon ko&apos;rsatadi</p>
        </div>
        <span
          className={
            "ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold " +
            (active ? "bg-brand-50 text-brand-700" : "bg-app text-faint")
          }
        >
          {active ? "Yoqilgan" : "O'chiq"}
        </span>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Masalan: Bugun kechqurun barcha taomlarga qo'shimcha chegirma!"
        className="input mb-3"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => save(true)}
          className="press flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          Yoqish / Saqlash
        </button>
        <button
          type="button"
          disabled={saving || !active}
          onClick={() => save(false)}
          className="press flex-1 rounded-xl bg-app py-2.5 text-sm font-bold text-muted disabled:opacity-40"
        >
          O&apos;chirish
        </button>
      </div>
    </div>
  );
}
