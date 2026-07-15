import "server-only";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Rasmni saqlaydi.
 * - Prod (Vercel): BLOB_READ_WRITE_TOKEN bo'lsa Vercel Blob'ga yuklaydi.
 * - Dev: token bo'lmasa public/uploads papkasiga yozadi (lokal fayl tizimi).
 * Har ikki holatda ochiq URL qaytaradi.
 */
export async function uploadImage(file: File, prefix = "dish"): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const key = `${prefix}_${randomUUID()}.${ext}`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(`uploads/${key}`, file, {
      access: "public",
      token,
    });
    return blob.url;
  }

  // Dev fallback — public/uploads
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), bytes);
  return `/uploads/${key}`;
}
