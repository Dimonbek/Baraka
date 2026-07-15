"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import { api, ApiError } from "@/lib/api-client";
import { haptic } from "@/lib/telegram-webapp";
import { CATEGORIES } from "@/lib/types";

const CATS = CATEGORIES.filter((c) => c.id !== "all");

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddDishSheet({ open, onClose, onCreated }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const orig = Number(form.get("originalPrice"));
    const disc = Number(form.get("discountPrice"));
    if (disc >= orig) {
      toast.error("Chegirma narxi asl narxdan past bo'lsin");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/seller/dishes", form);
      haptic.notify("success");
      toast.success("Taom qo'shildi");
      reset();
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Qo'shilmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-surface p-6 pb-safe"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Yangi taom</h2>
              <button
                type="button"
                onClick={onClose}
                className="press flex h-8 w-8 items-center justify-center rounded-full bg-app text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Rasm */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-app text-faint"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus size={28} />
                    <span className="text-xs font-medium">Rasm qo&apos;shish</span>
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />

              <Field label="Taom nomi">
                <input
                  name="name"
                  required
                  placeholder="Masalan: Toy oshi"
                  className="input"
                />
              </Field>

              <Field label="Toifa">
                <select name="category" className="input" defaultValue={CATS[0].id}>
                  {CATS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Asl narx (so'm)">
                  <input
                    name="originalPrice"
                    type="number"
                    required
                    min={0}
                    placeholder="45000"
                    className="input"
                  />
                </Field>
                <Field label="Chegirma narx">
                  <input
                    name="discountPrice"
                    type="number"
                    required
                    min={0}
                    placeholder="28000"
                    className="input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="Soni">
                  <input
                    name="quantity"
                    type="number"
                    defaultValue={5}
                    min={1}
                    className="input"
                  />
                </Field>
                <Field label="Boshlanish">
                  <input name="pickupStart" defaultValue="18:00" className="input" />
                </Field>
                <Field label="Tugash">
                  <input name="pickupEnd" defaultValue="21:30" className="input" />
                </Field>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="press w-full rounded-2xl bg-brand-600 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {submitting ? "Qo'shilmoqda..." : "Taomni qo'shish"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
