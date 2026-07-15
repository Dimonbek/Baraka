import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ota-papkalarda boshqa loyihalarning lockfile'lari bor (subtitr, ...).
  // Turbopack root'ni aniq loyiha papkasiga (dev/build cwd) qadaymiz.
  turbopack: {
    root: process.cwd(),
  },
  // Vercel Blob va boshqa tashqi rasm manbalari uchun
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
