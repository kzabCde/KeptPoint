"use client";

import { Check, Coffee, Gift, QrCode, Sparkles, Stamp, WalletCards } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

export function HeroProductWorkspace({ locale }: { locale: Locale }) {
  const t = landingCopy(locale).workspace;
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [balance, setBalance] = useState(1150);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    if (rootRef.current) observer.observe(rootRef.current);
    syncMotion();
    syncVisibility();
    media.addEventListener?.("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const reducedFrame = requestAnimationFrame(() => {
        setPhase(4);
        setBalance(1250);
      });
      return () => cancelAnimationFrame(reducedFrame);
    }
    if (!inView || !pageVisible) return;
    const durations = [1500, 1700, 1800, 1800, 1900, 1900, 900] as const;
    const timer = window.setTimeout(() => setPhase((current) => (current + 1) % durations.length), durations[phase]);
    return () => window.clearTimeout(timer);
  }, [inView, pageVisible, phase, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (phase !== 2 && phase !== 6) return;
    const from = balance;
    const to = phase === 2 ? 1250 : 1150;
    if (from === to) return;
    const duration = phase === 2 ? 650 : 700;
    const startedAt = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setBalance(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  // Balance changes are driven by the timeline phase; including `balance` here would restart the rAF every frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, reducedMotion]);

  const stamps = phase >= 3 && phase < 6 ? 3 : 2;
  const status = [t.scanStatus, t.successStatus, t.pointsStatus, t.stampStatus, t.unlockStatus, t.redeemedStatus, t.scanStatus][phase];

  return (
    <div ref={rootRef} className={cn("hero-workspace transition-opacity duration-500", phase === 6 && "opacity-80")} aria-label={t.label}>
      <p className="sr-only" aria-live="polite">{status}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3.5 sm:px-5 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-[#0F2D46] text-[#72E5D0]"><WalletCards className="size-4" /></span>
          <div><p className="text-sm font-bold">PumpPoint Wallet</p><p className="text-[10px] font-medium text-slate-400">{t.overview}</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold text-[#087F6E]"><span className="size-1.5 rounded-full bg-[#10C9A7]" />{t.active}</span>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-12">
        <section className="relative overflow-hidden rounded-[20px] bg-[#0F2D46] p-5 text-white sm:col-span-2 xl:col-span-7 xl:row-span-2 xl:min-h-[245px]">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.13em] text-white/45">{t.yourPoints}</p><div className="mt-2 flex items-end gap-2" aria-live="polite"><span className={cn("text-[52px] font-semibold leading-none tracking-[-.065em] transition-all duration-700", phase === 2 && "hero-data-pulse")}>{balance.toLocaleString()}</span><span className="mb-1 text-xs font-bold text-[#72E5D0]">PTS</span></div></div><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-[#72E5D0]">TEAL MEMBER</span></div>
          <div className="mt-8"><div className="flex items-center justify-between text-[10px] font-medium text-white/45"><span>1,000</span><span>1,500</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#10C9A7] transition-[width] duration-700 ease-out" style={{ width: phase >= 2 && phase < 6 ? "50%" : "30%" }} /></div><p className="mt-2 text-xs font-medium text-white/55">250 pts {t.nextTier}</p></div>
          <div className={cn("absolute bottom-5 right-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur transition-all duration-300", phase >= 1 && phase <= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}><span className="grid size-7 place-items-center rounded-lg bg-[#10C9A7] text-[#0F2D46]">+</span><div><p className="text-xs font-bold">+100 pts</p><p className="text-[9px] text-white/45">Bean &amp; Brew</p></div></div>
        </section>

        <section className="rounded-[20px] border border-slate-200/80 bg-[#E6FAF6] p-4 sm:col-span-1 xl:col-span-5 dark:border-white/10">
          <div className="flex items-center justify-between text-[#0F2D46]"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#087F6E]">Bean &amp; Brew</p><p className="mt-1 text-sm font-bold">{t.coffeeCard}</p></div><Stamp className="size-5 text-[#087F6E]" /></div>
          <div className="mt-5 flex gap-2">{[0, 1, 2, 3, 4].map((stamp) => <span key={stamp} className={cn("grid size-9 place-items-center rounded-full border-2 transition-all duration-500", stamp < stamps ? "border-[#10C9A7] bg-[#10C9A7] text-[#0F2D46]" : "border-[#0F2D46]/10 bg-white/75 text-[#0F2D46]/20", stamp === 2 && phase === 3 && "hero-stamp-pop")}><Coffee className="size-4" /></span>)}</div>
          <div className="mt-4 flex items-center justify-between"><span className="text-sm font-bold text-[#0F2D46]">{stamps} / 5</span><span className="text-[10px] font-semibold text-[#087F6E]">{phase >= 3 && phase < 6 ? t.stampAdded : t.visitsToReward}</span></div>
        </section>

        <section className={cn("rounded-[20px] border border-slate-200/80 bg-[#FFF4D6] p-4 transition-[transform,box-shadow] duration-500 sm:col-span-1 xl:col-span-5 dark:border-white/10", phase >= 4 && phase < 6 && "scale-[1.02] shadow-[0_12px_30px_rgba(251,191,36,.22)]")}>
          <div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-xl bg-white/65 text-[#B7791F]">{phase >= 5 && phase < 6 ? <Check className="size-[18px]" /> : <Gift className="size-[18px]" />}</span><span className="rounded-full bg-white/55 px-2 py-1 text-[9px] font-bold text-[#8B6415]">500 PTS</span></div><p className="mt-4 text-[10px] font-bold uppercase tracking-[.12em] text-[#B7791F]">{phase >= 5 && phase < 6 ? t.redeemed : t.reward}</p><div className="mt-1 flex items-center justify-between gap-3"><p className="text-lg font-bold tracking-[-.03em] text-[#0F2D46]">{t.freeCoffee}</p><span className={cn("rounded-lg px-2 py-1 text-[9px] font-bold transition-colors", phase >= 5 && phase < 6 ? "bg-[#0F2D46] text-white" : "bg-[#10C9A7] text-[#0F2D46]")}>{phase >= 5 && phase < 6 ? t.redeemed : t.redeem}</span></div>
        </section>

        <section className="hidden rounded-[20px] border border-slate-200/80 bg-white p-4 sm:block xl:col-span-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{t.recent}</p><div className="mt-3 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#E6FAF6] text-[#087F6E]"><Sparkles className="size-4" /></span><div className="min-w-0"><p className="truncate text-xs font-bold">Bean &amp; Brew</p><p className="mt-0.5 text-[10px] text-slate-400">{t.justNow}</p></div><span className={cn("ml-auto text-sm font-bold text-[#087F6E] transition-opacity duration-300", phase >= 1 && phase < 6 ? "opacity-100" : "opacity-30")}>+100</span></div>
        </section>

        <section className="rounded-[20px] bg-[#EAF2FF] p-4 xl:col-span-4">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#3B82F6]">{t.scanToCollect}</p><p className="mt-1 text-xs font-bold text-[#0F2D46]">QR Collection</p></div><div className="relative grid size-14 place-items-center rounded-xl bg-white"><QrCode className="size-10 text-[#0F2D46]"/><span className={cn("absolute inset-x-1.5 h-px bg-[#10C9A7] shadow-[0_0_6px_#10C9A7]", phase === 0 && !reducedMotion ? "hero-qr-scan" : "top-1/2")} /></div></div>
        </section>

        <section className="hidden items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white p-4 sm:flex xl:col-span-4 dark:border-white/10 dark:bg-white/5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0F2D46] text-[#72E5D0]"><Check className="size-5" /></span><div><p className="text-xs font-bold">{t.ready}</p><p className="mt-1 text-[10px] leading-4 text-slate-400">{t.summary}</p></div>
        </section>
      </div>
    </div>
  );
}
