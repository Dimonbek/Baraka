"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/telegram-webapp";

const TABS = [
  { href: "/", label: "Bosh", icon: Home },
  { href: "/orders", label: "Buyurtmalar", icon: ShoppingBag },
  { href: "/favorites", label: "Saralangan", icon: Heart },
  { href: "/profile", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptic.select()}
              className="press flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <span
                className={cn(
                  "flex h-9 w-14 items-center justify-center rounded-full transition-colors",
                  active ? "bg-brand-50 text-brand-600" : "text-faint",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-tight transition-colors",
                  active ? "text-brand-700" : "text-faint",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
