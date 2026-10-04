import Link from "next/link";
import { ArrowUpRight, Coins, Gift, Sparkles } from "lucide-react";
import { StampGrid } from "@/components/stamp-grid";
import { messages, type Locale } from "@/lib/i18n";

interface ProgramCardProps {
  name: string;
  subtitle: string;
  locale: Locale;
  href?: string;
  balance?: number;
  stamps?: { current: number; required: number };
  programType?: string;
  nextReward?: string;
}

export function ProgramCard({ name, subtitle, locale, href, balance, stamps, programType, nextReward }: ProgramCardProps) {
  const m = messages[locale].common;
  const th = locale === "th";
  const remaining = stamps ? Math.max(0, stamps.required - stamps.current) : 0;
  const initial = name.trim().slice(0, 1).toUpperCase() || "K";
  const content = (
    <article className="loyalty-card group min-w-0 p-5 transition">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-[#073f38] text-lg font-bold text-white shadow-sm">{initial}</span>
          <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-xs font-semibold uppercase tracking-[.08em] text-emerald-700 dark:text-emerald-300">{subtitle}</p>{programType === "hybrid" && <span className="rounded-full bg-lavender-soft px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-200">HYBRID</span>}</div><h3 className="mt-1 truncate text-lg font-semibold tracking-tight">{name}</h3></div>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/70 text-emerald-700 shadow-sm transition group-hover:translate-x-0.5 dark:bg-white/10 dark:text-emerald-300"><ArrowUpRight className="size-4"/></span>
      </div>

      {typeof balance === "number" && (
        <div className="mt-6 flex items-end justify-between gap-3">
          <div><p className="text-xs font-medium text-zinc-500">{th ? "ยอดที่ใช้ได้" : "Available"}</p><p className="mt-1 break-words text-3xl font-semibold tracking-[-0.055em]">{balance.toLocaleString(locale === "th" ? "th-TH" : "en-US")} <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{m.points}</span></p></div>
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-mint-soft text-emerald-700 dark:text-emerald-200"><Coins className="size-5"/></span>
        </div>
      )}

      {stamps && stamps.required > 0 && (
        <div className="mt-5 rounded-[20px] bg-white/55 p-4 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{th ? "บัตรสแตมป์" : "Stamp card"}</p><span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{stamps.current}/{stamps.required}</span></div>
          <StampGrid current={stamps.current} required={stamps.required} compact className="mt-3"/>
          <p className="mt-3 text-xs text-zinc-500">{remaining === 0 ? (th ? "ครบแล้ว! พร้อมรับรางวัล 🎉" : "Complete! Reward ready 🎉") : remaining <= 2 ? (th ? `อีก ${remaining} ดวง ก็ถึงรางวัลแล้ว ✨` : `${remaining} more to your reward ✨`) : (th ? `เหลืออีก ${remaining} สแตมป์` : `${remaining} stamps to go`)}</p>
        </div>
      )}

      {nextReward && <div className="reward-bubble mt-4 flex items-center gap-2 rounded-2xl px-3.5 py-3"><Gift className="size-4 shrink-0 text-amber-600"/><p className="min-w-0 truncate text-xs font-semibold text-amber-900 dark:text-amber-100">{nextReward}</p><Sparkles className="ml-auto size-4 shrink-0 text-amber-500"/></div>}
    </article>
  );
  return href ? <Link href={href} className="block min-w-0">{content}</Link> : content;
}
