"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ImageOff, Loader2, Upload } from "lucide-react";
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
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATS[0].id);
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Sotuvchi o'z rasmini yuklasa
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  // Nom (yoki toifa) o'zgarganda — debounce bilan rasm takliflarini olamiz.
  useEffect(() => {
    const q = name.trim();
    if (q.length < 2) {
      setImages([]);
      setSelected(null);
      return;
    }
    const id = ++reqId.current;
    setLoadingImages(true);
    const t = setTimeout(async () => {
      try {
        const res = await api.get<{ images: string[] }>(
          `/api/seller/dish-images?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`,
        );
        if (id !== reqId.current) return; // eskirgan javob
        setImages(res.images);
        // Avvalgi tanlov yangi ro'yxatda bo'lmasa — birinchisini tanlaymiz.
        setSelected((prev) =>
          prev && res.images.includes(prev) ? prev : (res.images[0] ?? null),
        );
      } catch {
        if (id === reqId.current) setImages([]);
      } finally {
        if (id === reqId.current) setLoadingImages(false);
      }
    }, 450);
    return () => clearTimeout(t);
  }, [name, category]);

  function reset() {
    setName("");
    setCategory(CATS[0].id);
    setImages([]);
    setSelected(null);
    setUploadFile(null);
    setUploadPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadFile(f);
    setUploadPreview(URL.createObjectURL(f));
    setSelected(null); // yuklangan rasm taklifni bekor qiladi
    haptic.select();
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
    // Yuklangan rasm ustuvor; aks holda tanlangan taklif URL'i.
    if (uploadFile) {
      form.set("image", uploadFile);
      form.delete("imageUrl");
    } else if (selected) {
      form.set("imageUrl", selected);
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
              <Field label="Taom nomi">
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Osh, Somsa, Lag'mon..."
                  className="input"
                  autoComplete="off"
                />
              </Field>

              {/* Rasm: taklif tanlash yoki o'z rasmini yuklash */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Rasm</span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="press flex items-center gap-1 text-xs font-bold text-brand-600"
                  >
                    <Upload size={13} /> O&apos;z rasmim
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onFilePick}
                  className="hidden"
                />

                {uploadPreview ? (
                  // Yuklangan rasm
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border-2 border-brand-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadPreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="press absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-white"
                    >
                      <X size={15} />
                    </button>
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-bold text-white">
                      <Check size={12} strokeWidth={3} /> O&apos;z rasmingiz
                    </span>
                  </div>
                ) : name.trim().length < 2 ? (
                  <div className="flex h-24 items-center justify-center rounded-2xl border-2 border-dashed border-line bg-app px-4 text-center text-xs text-faint">
                    Taom nomini yozing — mos rasmlar chiqadi, yoki o&apos;z
                    rasmingizni yuklang
                  </div>
                ) : loadingImages ? (
                  <div className="grid grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square animate-pulse rounded-xl bg-app"
                      />
                    ))}
                  </div>
                ) : images.length === 0 ? (
                  <div className="flex h-24 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-app px-4 text-center text-xs text-faint">
                    <ImageOff size={16} /> Mos rasm topilmadi — o&apos;z rasmingizni
                    yuklang
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5">
                    {images.map((url) => {
                      const active = selected === url;
                      return (
                        <button
                          type="button"
                          key={url}
                          onClick={() => {
                            setSelected(url);
                            haptic.select();
                          }}
                          className={
                            "press relative aspect-square overflow-hidden rounded-xl border-2 " +
                            (active ? "border-brand-600" : "border-transparent")
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                          {active && (
                            <span className="absolute inset-0 flex items-center justify-center bg-brand-600/30">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                                <Check size={14} strokeWidth={3} />
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Field label="Toifa">
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                >
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
                className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
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
