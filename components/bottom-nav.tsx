"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, QrCode, Sparkles, WalletCards } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { productMessages } from "@/lib/product-i18n";
import { cn } from "@/lib/utils";

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = productMessages[locale].personalNav;
  const items = [
    { href: "/home", label: t.home, icon: House, primary: false },
    { href: "/wallet", label: t.wallet, icon: WalletCards, primary: false },
    { href: "/scan", label: t.scan, icon: QrCode, primary: true },
    { href: "/benefits", label: t.benefits, icon: Sparkles, primary: false },
    { href: "/explore", label: t.explore, icon: Compass, primary: false },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label={locale === "th" ? "เมนูส่วนตัว" : "Personal navigation"}>
      <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-1 rounded-[22px] border border-slate-200/90 bg-[color:color-mix(in_srgb,var(--surface)_94%,transparent)] px-2 py-2 shadow-[0_12px_32px_rgba(15,45,70,.14)] backdrop-blur-xl dark:border-white/10">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition", active ? "text-[#087F6E] dark:text-teal-300" : "text-slate-500")}>
              <span className={cn("grid size-8 place-items-center rounded-xl transition", active && !primary && "bg-mint-soft", primary && "-mt-7 size-14 rounded-[18px] bg-[#0F2D46] text-white shadow-lg shadow-slate-900/20 ring-4 ring-[var(--surface)]")}>
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
