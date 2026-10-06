"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3, Bell, Gift, LayoutDashboard, Menu, Settings, Sparkles, Target, UserRound, UsersRound, WalletCards } from "lucide-react";
import { Brand } from "@/components/brand";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import type { Locale } from "@/lib/i18n";
import { productMessages } from "@/lib/product-i18n";
import type { BusinessWorkspace } from "@/lib/workspaces";
import { cn } from "@/lib/utils";

export function MerchantShell({ children, slug, programName, locale, businesses, role }: { children: React.ReactNode; slug: string; programName: string; locale: Locale; businesses: BusinessWorkspace[]; role: string }) {
  const pathname = usePathname();
  const t = productMessages[locale];
  const base = `/programs/${slug}/manage`;
  const groups = [
    { label: "", items: [[base, t.businessNav.overview, LayoutDashboard]] },
    { label: t.businessNav.manage, items: [[`${base}/members`, t.businessNav.customers, UsersRound], [`${base}/loyalty`, t.businessNav.loyalty, WalletCards], [`${base}/rewards`, t.businessNav.rewards, Gift]] },
    { label: t.businessNav.grow, items: [[`${base}/growth`, t.businessNav.growth, Sparkles], [`${base}/analytics`, t.businessNav.insights, BarChart3]] },
    { label: t.businessNav.operate, items: [[`${base}/operations`, t.businessNav.operations, Target], [`${base}/settings`, t.businessNav.settings, Settings]] },
  ] as const;
  const allItems = groups.flatMap((group) => group.items);
  const isActive = (href: string) => href === base ? pathname === base : pathname === href || pathname.startsWith(`${href}/`);

  return <div className="min-h-dvh bg-[#F7F9FC] dark:bg-[#071523]">
    <div className="mx-auto lg:grid lg:max-w-[1520px] lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--border)] bg-white px-4 py-6 dark:bg-[var(--surface)] lg:flex lg:flex-col">
        <Link href="/home" className="px-2"><Brand compact /></Link>
        <p className="mt-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Build loyalty · Grow customers</p>
        <WorkspaceSwitcher locale={locale} businesses={businesses} mode="business" currentSlug={slug} className="mt-6" />
        <div className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{role}</div>

        <nav className="mt-5 grid gap-5" aria-label={locale === "th" ? "เมนูธุรกิจ" : "Business navigation"}>
          {groups.map((group) => <div key={group.label || "overview"}>{group.label && <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{group.label}</p>}<div className="grid gap-1">{group.items.map(([href, label, Icon]) => <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={cn("flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition", isActive(href) ? "bg-[#E6FAF6] text-[#087F6E] dark:bg-teal-950/50 dark:text-teal-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5")}><Icon className="size-[17px]" />{label}</Link>)}</div></div>)}
        </nav>

        <Link href={`/programs/${slug}`} className="mt-auto flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"><ArrowLeft className="size-4" />{t.workspace.customerView}</Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-50 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_95%,transparent)] px-4 backdrop-blur-xl lg:px-7">
          <div className="hidden min-w-0 lg:block"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#087F6E]">Business</p><p className="truncate text-sm font-semibold text-[#0F2D46] dark:text-white">{programName}</p></div>
          <div className="lg:hidden"><WorkspaceSwitcher locale={locale} businesses={businesses} mode="business" currentSlug={slug} compact /></div>
          <details className="relative ml-auto lg:hidden"><summary className="cute-icon-button flex cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden" aria-label={locale === "th" ? "เปิดเมนูธุรกิจ" : "Open business menu"}><Menu className="size-5" /></summary><div className="absolute right-0 mt-2 w-[min(310px,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_18px_48px_rgba(15,45,70,.16)]">{allItems.map(([href,label,Icon]) => <Link key={href} href={href} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold", isActive(href) ? "bg-[#E6FAF6] text-[#087F6E]" : "hover:bg-slate-50 dark:hover:bg-white/5")}><Icon className="size-4" />{label}</Link>)}<div className="my-1 border-t border-[var(--border)]"/><Link href={`/programs/${slug}`} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500"><ArrowLeft className="size-4" />{t.workspace.customerView}</Link></div></details>
          <div className="hidden items-center gap-2 lg:flex"><Link href="/notifications" className="cute-icon-button" aria-label={t.personalNav.notifications}><Bell className="size-[18px]" /></Link><Link href="/profile" className="cute-icon-button" aria-label={t.personalNav.profile}><UserRound className="size-[18px]" /></Link></div>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  </div>;
}
