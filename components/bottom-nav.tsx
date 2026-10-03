"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, House, QrCode, UserRound, WalletCards } from "lucide-react";
import { messages, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const m = messages[locale].nav;
  const items = [
    { href: "/home", label: m.home, icon: House, primary: false },
    { href: "/wallet", label: m.wallet, icon: WalletCards, primary: false },
    { href: "/scan", label: m.scan, icon: QrCode, primary: true },
    { href: "/activity", label: m.activity, icon: Activity, primary: false },
    { href: "/profile", label: m.profile, icon: UserRound, primary: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl border-t border-zinc-200/80 bg-white/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl dark:border-zinc-800 dark:bg-[#07110f]/95">
      <div className="grid grid-cols-5 items-end gap-1">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition", active ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-500")}>
              <span className={cn("grid size-7 place-items-center", primary && "-mt-6 size-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-950/20 ring-4 ring-white dark:bg-emerald-400 dark:text-emerald-950 dark:ring-[#07110f]")}>
                <Icon className={primary ? "size-6" : "size-5"} />
              </span>
              <span className={primary ? "mt-1" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
