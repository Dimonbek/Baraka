import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Uvol Bo'lmasin — Isrofni to'xtat, barakani top",
  description:
    "Kechki chegirmali taomlar bir joyda. Restoranlar qolgan taomlarini arzon narxda taklif qiladi — siz tejaysiz, isrof kamayadi.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={jakarta.variable} suppressHydrationWarning>
      <head>
        {/* Telegram Mini App SDK — sahifadan oldin yuklanadi */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
