"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Gift, House, QrCode, Settings, UserRound, WalletCards } from "lucide-react";
import { Brand } from "@/components/brand";
import { BottomNav } from "@/components/bottom-nav";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  locale: Locale;
  displayName: string;
  unread: number;
};

export function AppShell({ children, locale, displayName, unread }: Props) {
  const pathname = usePathname();
  const th = locale === "th";
  const items = [
    { href: "/home", label: th ? "หน้าหลัก" : "Dashboard", icon: House },
    { href: "/rewards", label: th ? "รางวัล" : "Rewards", icon: Gift },
    { href: "/wallet", label: th ? "วอลเล็ต" : "Wallet", icon: WalletCards },
    { href: "/explore", label: th ? "ค้นหาร้าน" : "Explore stores", icon: Compass },
    { href: "/profile", label: th ? "โปรไฟล์" : "Profile", icon: UserRound },
  ];

  return (
    <div className="app-shell min-h-dvh">
      <div className="app-container lg:grid lg:min-h-dvh lg:grid-cols-[244px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 lg:flex lg:flex-col">
          <Link href="/home" className="px-2"><Brand compact /></Link>
          <p className="mt-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Collect · Reward · Go Further</p>

          <nav className="mt-8 grid gap-1.5" aria-label={th ? "เมนูหลัก" : "Primary navigation"}>
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} href={href} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", active ? "bg-[#E6FAF6] text-[#087F6E] dark:bg-teal-950/50 dark:text-teal-200" : "text-slate-600 hover:bg-slate-50 hover:text-[#0F2D46] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white")}><Icon className="size-[18px]" />{label}</Link>;
            })}
          </nav>

          <Link href="/scan" className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46] shadow-[0_8px_20px_rgba(16,201,167,.18)] transition hover:bg-[#21d4b3]"><QrCode className="size-5" />{th ? "สแกน / สะสม" : "Scan / Collect"}</Link>

          <div className="mt-auto border-t border-[var(--border)] pt-4">
            <Link href="/settings" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"><Settings className="size-[18px]" />{th ? "การตั้งค่า" : "Settings"}</Link>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="app-topbar sticky top-0 z-40 hidden items-center justify-between gap-4 px-7 lg:flex">
            <div className="min-w-0"><p className="text-xs font-medium text-slate-400">{th ? "สวัสดี" : "Welcome back"}</p><p className="truncate text-sm font-semibold text-[#10243A] dark:text-white">{displayName}</p></div>
            <div className="flex items-center gap-2">
              <Link href="/notifications" aria-label={th ? "การแจ้งเตือน" : "Notifications"} className="cute-icon-button relative"><Bell className="size-[18px]" />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#FBBF24] px-1 text-[10px] font-bold text-[#0F2D46] ring-2 ring-white">{Math.min(99, unread)}</span>}</Link>
              <Link href="/profile" className="ml-1 grid size-10 place-items-center rounded-full bg-[#0F2D46] text-sm font-bold text-white" aria-label={th ? "โปรไฟล์" : "Profile"}>{displayName.slice(0, 1).toUpperCase()}</Link>
            </div>
          </header>
          <div className="mx-auto min-w-0 max-w-[1200px] pb-28 lg:pb-0">{children}</div>
          <BottomNav locale={locale} />
        </div>
      </div>
    </div>
  );
}
