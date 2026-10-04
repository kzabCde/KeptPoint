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
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="grid grid-cols-5 items-end gap-1 rounded-[26px] border border-emerald-950/10 bg-[color:color-mix(in_srgb,var(--surface)_94%,transparent)] px-2 py-2 shadow-[0_14px_40px_rgba(15,62,51,.18)] backdrop-blur-xl dark:border-white/10">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={cn("flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-bold transition", active ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-500")}>
              <span className={cn("grid size-8 place-items-center rounded-xl transition", active && !primary && "bg-mint-soft", primary && "-mt-7 size-14 rounded-[20px] bg-[#073f38] text-white shadow-lg shadow-emerald-950/25 ring-4 ring-[var(--surface)] dark:bg-emerald-300 dark:text-emerald-950")}>
                <Icon className={primary ? "size-6" : "size-5"} />
              </span>
              <span className={cn("max-w-full truncate", primary && "mt-1")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
