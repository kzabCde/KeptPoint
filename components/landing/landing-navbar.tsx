"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe2, Menu, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { saveLocale } from "@/app/actions/preferences";
import { Brand } from "@/components/brand";
import type { Locale } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

function LanguageSelect({ locale, compact = false, tabIndex }: { locale: Locale; compact?: boolean; tabIndex?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = landingCopy(locale);

  return (
    <label className={cn("relative flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0F2D46] dark:border-white/10 dark:bg-white/5 dark:text-white", compact ? "w-full" : "min-w-[112px]")}>
      <Globe2 className="size-4 shrink-0 text-[#087F6E]" aria-hidden="true" />
      <span className="sr-only">{pending ? t.language.changing : t.language.label}</span>
      <select
        value={locale}
        tabIndex={tabIndex}
        disabled={pending}
        aria-label={t.language.label}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          startTransition(async () => {
            await saveLocale(nextLocale);
            router.refresh();
          });
        }}
        className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-4 text-sm font-semibold outline-none disabled:cursor-wait disabled:opacity-60"
      >
        <option value="th">{t.language.thai}</option>
        <option value="en">{t.language.english}</option>
      </select>
      <span className="pointer-events-none absolute right-3 text-[9px] text-slate-400" aria-hidden="true">▼</span>
    </label>
  );
}

export function LandingNavbar({ locale }: { locale: Locale }) {
  const t = landingCopy(locale);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const links = [
    ["#product", t.nav.product],
    ["#how", t.nav.how],
    ["#rewards", t.nav.rewards],
    ["#business", t.nav.business],
  ] as const;

  return <header className={cn("fixed inset-x-0 top-0 z-50 mx-auto transition-all duration-300", scrolled ? "border-b border-slate-200/80 bg-white/[.86] shadow-[0_8px_30px_rgba(15,45,70,.05)] backdrop-blur-xl dark:border-white/10 dark:bg-[#071523]/90" : "bg-transparent")}>
    <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
      <Link href="/" aria-label={t.nav.home}><Brand compact /></Link>
      <nav className="hidden items-center gap-7 lg:flex" aria-label={t.nav.website}>{links.map(([href, label]) => <Link key={href} href={href} className="text-sm font-semibold text-slate-500 transition hover:text-[#0F2D46] dark:text-slate-300 dark:hover:text-white">{label}</Link>)}</nav>
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <LanguageSelect locale={locale} />
        <Link href="/login" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-[#0F2D46] dark:text-white">{t.nav.signIn}</Link>
        <Link href="/signup" className="inline-flex min-h-11 items-center rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46] transition hover:-translate-y-px hover:bg-[#23d4b4]">{t.nav.getStarted}</Link>
      </div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="landing-mobile-menu" aria-label={open ? t.nav.closeMenu : t.nav.openMenu} className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-[#0F2D46] shadow-sm sm:ml-0 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
    </div>
    <div id="landing-mobile-menu" aria-hidden={!open} className={cn("overflow-hidden border-t border-slate-200/70 bg-white/95 px-5 transition-[max-height,opacity] duration-300 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#071523]/95", open ? "max-h-[32rem] opacity-100" : "max-h-0 border-t-0 opacity-0")}>
      <nav className="mx-auto grid max-w-[1240px] gap-1 py-4">{links.map(([href, label]) => <Link key={href} href={href} tabIndex={open ? undefined : -1} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">{label}</Link>)}<div className="mt-2 sm:hidden"><LanguageSelect locale={locale} compact tabIndex={open ? undefined : -1} /></div><div className="mt-2 grid grid-cols-2 gap-2 sm:hidden"><Link href="/login" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold">{t.nav.signIn}</Link><Link href="/signup" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#10C9A7] px-3 text-sm font-bold text-[#0F2D46]">{t.nav.getStarted}</Link></div></nav>
    </div>
  </header>;
}
