"use client";

import Link from "next/link";
import { Building2, ChevronDown, Plus, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { productMessages } from "@/lib/product-i18n";
import type { BusinessWorkspace } from "@/lib/workspaces";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
  locale,
  businesses,
  mode,
  currentSlug,
  compact = false,
  className,
}: {
  locale: Locale;
  businesses: BusinessWorkspace[];
  mode: "personal" | "business";
  currentSlug?: string;
  compact?: boolean;
  className?: string;
}) {
  const t = productMessages[locale].workspace;
  const activeBusiness = businesses.find((business) => business.slug === currentSlug);
  const label = mode === "business" ? activeBusiness?.name ?? t.business : t.personal;

  return (
    <details className={cn("group relative", className)}>
      <summary
        aria-label={t.switchWorkspace}
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] font-semibold text-[#0F2D46] shadow-sm transition hover:border-[#10C9A7]/50 dark:text-white [&::-webkit-details-marker]:hidden",
          compact ? "px-2.5 text-xs" : "w-full px-3 text-sm",
        )}
      >
        <span className={cn("grid shrink-0 place-items-center rounded-lg bg-[#E6FAF6] text-[#087F6E]", compact ? "size-7" : "size-8")}>
          {mode === "business" ? <Building2 className="size-4" /> : <UserRound className="size-4" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
      </summary>

      <div className="absolute left-0 z-[70] mt-2 w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_18px_48px_rgba(15,45,70,.16)]">
        <Link href="/home" className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5", mode === "personal" && "bg-[#E6FAF6] text-[#087F6E]")}>
          <UserRound className="size-4" />
          <span>{t.personal}</span>
        </Link>

        <div className="my-2 border-t border-[var(--border)]" />
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">{t.business}</div>
        {businesses.map((business) => (
          <Link
            key={business.id}
            href={`/programs/${business.slug}/manage`}
            className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5", mode === "business" && business.slug === currentSlug && "bg-[#E6FAF6] text-[#087F6E]")}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0F2D46] text-xs font-bold text-white">{business.name.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 flex-1 truncate">{business.name}</span>
            <span className="text-[10px] font-medium text-slate-400">{business.role}</span>
          </Link>
        ))}
        {businesses.length === 0 && (
          <Link href="/business" className="block rounded-xl px-3 py-3 text-xs leading-5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5">
            {locale === "th" ? "ยังไม่มีร้านค้า — เริ่มสร้างโปรแกรม Loyalty ได้เลย" : "No businesses yet — start your first loyalty program."}
          </Link>
        )}
        <Link href="/programs/new" className="mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#087F6E] hover:bg-[#E6FAF6]">
          <Plus className="size-4" />
          {t.createProgram}
        </Link>
      </div>
    </details>
  );
}
