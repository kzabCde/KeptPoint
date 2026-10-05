"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Gift, LayoutDashboard, QrCode, ReceiptText, UsersRound } from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

export function MerchantShell({ children, slug, programName }: { children: React.ReactNode; slug: string; programName: string }) {
  const pathname = usePathname();
  const base = `/programs/${slug}/manage`;
  const items = [
    [base, "Overview", LayoutDashboard],
    [`${base}/members`, "Customers", UsersRound],
    [`${base}/rewards`, "Rewards", Gift],
    [`${base}/qr`, "QR / Scanner", QrCode],
    [`${base}/redemptions`, "Transactions", ReceiptText],
  ] as const;
  return <div className="min-h-dvh bg-[#F7F9FC] dark:bg-[#071523]">
    <div className="mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--border)] bg-white px-4 py-6 dark:bg-[var(--surface)] lg:flex lg:flex-col">
        <Brand compact />
        <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Business</p>
        <p className="mt-1 truncate px-3 text-sm font-semibold text-[#0F2D46] dark:text-white">{programName}</p>
        <nav className="mt-5 grid gap-1.5">{items.map(([href, label, Icon]) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold", active ? "bg-[#E6FAF6] text-[#087F6E]" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5")}><Icon className="size-[18px]" />{label}</Link>;
        })}</nav>
        <Link href={`/programs/${slug}`} className="mt-auto flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"><ArrowLeft className="size-4" />Customer view</Link>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  </div>;
}
