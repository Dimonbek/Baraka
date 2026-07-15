import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ota-papkalarda boshqa loyihalarning lockfile'lari bor (subtitr, ...).
  // Turbopack root'ni aniq loyiha papkasiga (dev/build cwd) qadaymiz.
  turbopack: {
    root: process.cwd(),
  },
  // Dev'da ngrok domeni orqali (Telegram Mini App) kirishga ruxsat.
  allowedDevOrigins: ["shadowed-adelyn-goosenecked.ngrok-free.dev"],
  // Vercel Blob va boshqa tashqi rasm manbalari uchun
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
