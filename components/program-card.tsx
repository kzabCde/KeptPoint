import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { messages, type Locale } from "@/lib/i18n";

interface ProgramCardProps {
  name: string;
  subtitle: string;
  locale: Locale;
  href?: string;
  balance?: number;
  stamps?: { current: number; required: number };
}

export function ProgramCard({ name, subtitle, locale, href, balance, stamps }: ProgramCardProps) {
  const m = messages[locale].common;
  const content = (
    <Card className="group min-w-0 overflow-hidden p-5 transition hover:border-emerald-300 dark:hover:border-emerald-800">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0"><p className="truncate text-sm text-zinc-500">{subtitle}</p><h3 className="mt-1 truncate text-lg font-semibold tracking-tight">{name}</h3></div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"><ArrowUpRight className="size-4"/></span>
      </div>
      {typeof balance === "number" && <p className="mt-8 break-words text-3xl font-semibold tracking-[-0.04em]">{balance.toLocaleString(locale === "th" ? "th-TH" : "en-US")} <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{m.points}</span></p>}
      {stamps && (
        <div className="mt-7">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, (stamps.current / Math.max(1, stamps.required)) * 100))}%` }}/></div>
          <p className="mt-3 text-sm text-zinc-500">{stamps.current} / {stamps.required} {m.stamps}</p>
        </div>
      )}
    </Card>
  );
  return href ? <Link href={href} className="block min-w-0">{content}</Link> : content;
}
