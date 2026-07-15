import { Toaster } from "react-hot-toast";
import { TelegramProvider } from "@/components/telegram-provider";
import { BottomNav } from "@/components/bottom-nav";

// Telegram Mini App qobig'i — barcha xaridor/sotuvchi sahifalari shu ichida.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramProvider>
      <div className="mx-auto min-h-screen w-full max-w-md">
        <main className="px-5 pb-28 pt-6">{children}</main>
      </div>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2800,
          style: {
            background: "#ffffff",
            color: "#0f172a",
            border: "1px solid #e8eaee",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 10px 30px -12px rgba(15,23,42,0.18)",
          },
          success: { iconTheme: { primary: "#059669", secondary: "#ffffff" } },
        }}
      />
    </TelegramProvider>
  );
}
