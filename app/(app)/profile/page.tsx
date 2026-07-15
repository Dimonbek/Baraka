"use client";

import Link from "next/link";
import { Store, ChevronRight, UserRound } from "lucide-react";
import { useTelegram } from "@/components/telegram-provider";
import { PageHeader } from "@/components/ui/page-header";

export default function ProfilePage() {
  const { user, inTelegram } = useTelegram();
  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ")
    : "Demo Foydalanuvchi";

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" />

      <div className="card flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <UserRound size={26} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-ink">{name}</p>
          <p className="text-sm text-muted">
            {inTelegram ? "Telegram orqali kirilgan" : "Brauzer (dev) rejimi"}
          </p>
        </div>
      </div>

      <Link
        href="/seller"
        className="press card flex items-center gap-4 p-4"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
          <Store size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Sotuvchi kabineti</p>
          <p className="text-sm text-muted">Taom qo'shing va sotishni boshlang</p>
        </div>
        <ChevronRight size={20} className="text-faint" />
      </Link>
    </div>
  );
}
