"use client";

import { Check, Gift, QrCode, ScanLine, Stamp, WalletCards } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

type Mode = "collect" | "stamp" | "redeem" | "track";

export function ProductDemo({ locale }: { locale: Locale }) {
  const t = landingCopy(locale).demo;
  const [mode, setMode] = useState<Mode>("collect");
  const [redeemed, setRedeemed] = useState(false);
  const tabs: Array<{ id: Mode; label: string; copy: string; icon: typeof QrCode }> = [
    { id: "collect", ...t.tabs[0], icon: ScanLine },
    { id: "stamp", ...t.tabs[1], icon: Stamp },
    { id: "redeem", ...t.tabs[2], icon: Gift },
    { id: "track", ...t.tabs[3], icon: WalletCards },
  ];

  return <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
    <div role="tablist" aria-label={t.label} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">{tabs.map((tab) => { const Icon = tab.icon; const active = mode === tab.id; return <button key={tab.id} id={`landing-tab-${tab.id}`} type="button" role="tab" aria-selected={active} aria-controls="landing-product-panel" onClick={() => setMode(tab.id)} className={cn("group min-h-20 rounded-2xl border p-4 text-left transition", active ? "border-[#10C9A7]/50 bg-[#E6FAF6] shadow-[0_8px_24px_rgba(15,45,70,.06)] dark:bg-teal-950/30" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/5")}><div className="flex items-start gap-3"><span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", active ? "bg-[#10C9A7] text-[#0F2D46]" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300")}><Icon className="size-[18px]" /></span><span><span className="block font-semibold">{tab.label}</span><span className="mt-1 block text-sm leading-5 text-slate-500">{tab.copy}</span></span></div></button>; })}</div>

    <div className="relative min-h-[520px] overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(145deg,#EEFDF9,#EDF4FF)] p-5 shadow-[0_30px_80px_rgba(15,45,70,.12)] sm:p-8 dark:border-white/10 dark:bg-[linear-gradient(145deg,#0C2929,#10243A)]">
      <div className="absolute -right-20 -top-16 size-56 rounded-full bg-[#3B82F6]/10 blur-3xl" />
      <div id="landing-product-panel" role="tabpanel" aria-labelledby={`landing-tab-${mode}`} className="relative mx-auto min-h-[450px] max-w-[330px] overflow-hidden rounded-[32px] border-[7px] border-[#0F2D46] bg-white p-5 shadow-2xl dark:bg-[#0B1B2A]">
        <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-slate-200 dark:bg-white/15" />
        {mode === "collect" && <div className="landing-demo-state"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#087F6E]">{t.scan}</p><h3 className="mt-1 text-xl font-semibold">PumpPoint QR</h3><div className="relative mt-6 aspect-square overflow-hidden rounded-3xl bg-[#0F2D46] p-9"><div className="grid h-full place-items-center rounded-2xl bg-white"><QrCode className="size-24 text-[#0F2D46]" /></div><span className="absolute left-5 top-5 size-9 border-l-2 border-t-2 border-[#10C9A7]" /><span className="absolute bottom-5 right-5 size-9 border-b-2 border-r-2 border-[#10C9A7]" /></div><div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#E6FAF6] p-4 text-[#0F2D46]"><Check className="size-5 text-[#0AA98D]" /><div><p className="text-xs text-slate-500">Bean & Brew</p><p className="font-bold">+100 pts</p></div></div></div>}
        {mode === "stamp" && <div className="landing-demo-state"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#087F6E]">Bean & Brew</p><h3 className="mt-1 text-xl font-semibold">{t.freeCoffeeCard}</h3><div className="mt-7 rounded-3xl border border-slate-200 bg-[#F7F9FC] p-5 dark:border-white/10 dark:bg-white/5"><div className="grid grid-cols-5 gap-2">{[0,1,2,3,4].map((index) => <span key={index} className={cn("grid aspect-square place-items-center rounded-full border-2", index < 3 ? "border-[#10C9A7] bg-[#10C9A7] text-[#0F2D46]" : "border-dashed border-slate-300 text-slate-300")}><Stamp className="size-5" /></span>)}</div><div className="mt-5 flex justify-between text-sm"><span className="text-slate-500">3 / 5 {t.stamps}</span><span className="font-bold text-[#087F6E]">60%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-3/5 rounded-full bg-[#10C9A7]" /></div></div><p className="mt-5 text-sm leading-6 text-slate-500">{t.twoVisits}</p></div>}
        {mode === "redeem" && <div className="landing-demo-state"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#087F6E]">{redeemed ? t.redeemed : t.ready}</p><h3 className="mt-1 text-xl font-semibold">{t.yourReward}</h3><div className="mt-7 rounded-3xl border border-amber-200 bg-[#FFF6D8] p-5"><span className="grid size-12 place-items-center rounded-2xl bg-[#FBBF24] text-[#0F2D46]">{redeemed ? <Check className="size-6" /> : <Gift className="size-6" />}</span><p className="mt-5 text-lg font-bold text-[#10243A]">{t.freeCoffee}</p><p className="mt-1 text-sm text-slate-500">Bean & Brew</p><p className="mt-5 text-3xl font-bold text-[#10243A]">500 <span className="text-sm font-semibold text-slate-500">pts</span></p><button type="button" disabled={redeemed} onClick={() => setRedeemed(true)} className="mt-6 min-h-12 w-full rounded-xl bg-[#10C9A7] font-bold text-[#0F2D46] transition disabled:cursor-default disabled:bg-[#0F2D46] disabled:text-white">{redeemed ? t.redeemedButton : t.redeemButton}</button></div><p className="mt-4 text-center text-xs text-slate-400">{redeemed ? t.remaining : t.afterRedeem}</p></div>}
        {mode === "track" && <div className="landing-demo-state"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#087F6E]">{t.wallet}</p><h3 className="mt-1 text-xl font-semibold">{t.recent}</h3><div className="mt-6 rounded-3xl bg-[linear-gradient(135deg,#10C9A7,#3B82F6)] p-5 text-white"><p className="text-xs text-white/70">{t.yourPoints}</p><p className="mt-1 text-4xl font-bold">1,250</p><p className="mt-4 text-xs font-semibold">Teal Member</p></div><div className="mt-4 divide-y divide-slate-100 dark:divide-white/10">{[["Bean & Brew","+100",true],["Fresh Fuel","+50",true],[t.freePastry,"−400",false]].map(([name, amount, positive]) => <div key={String(name)} className="flex items-center justify-between py-4"><div><p className="text-sm font-semibold">{String(name)}</p><p className="mt-1 text-xs text-slate-400">{t.today}</p></div><span className={cn("text-sm font-bold", positive ? "text-[#0AA98D]" : "text-red-500")}>{String(amount)} pts</span></div>)}</div></div>}
      </div>
    </div>
  </div>;
}
