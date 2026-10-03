"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, House, QrCode, UserRound, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", icon: House, primary: false },
  { href: "/wallet", label: "Wallet", icon: WalletCards, primary: false },
  { href: "/scan", label: "Scan", icon: QrCode, primary: true },
  { href: "/activity", label: "Activity", icon: Activity, primary: false },
  { href: "/profile", label: "Profile", icon: UserRound, primary: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-xl border-t border-zinc-200/80 bg-white/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="grid grid-cols-5 items-end gap-1">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium", active ? "text-zinc-950 dark:text-white" : "text-zinc-500")}>
              <span className={cn("grid size-7 place-items-center", primary && "-mt-6 size-14 rounded-full bg-zinc-950 text-white shadow-lg ring-4 ring-white dark:bg-white dark:text-zinc-950 dark:ring-zinc-950") }>
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
