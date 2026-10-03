import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { messages, type Locale } from "@/lib/i18n";

interface ProgramCardProps {
  name: string;
  subtitle: string;
  locale: Locale;
  balance?: number;
  stamps?: { current: number; required: number };
}

export function ProgramCard({ name, subtitle, locale, balance, stamps }: ProgramCardProps) {
  const m = messages[locale].common;
  return (
    <Card className="group overflow-hidden p-5 transition hover:border-emerald-300 dark:hover:border-emerald-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{subtitle}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{name}</h3>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"><ArrowUpRight className="size-4" /></span>
      </div>
      {typeof balance === "number" && <p className="mt-8 text-3xl font-semibold tracking-[-0.04em]">{balance.toLocaleString(locale === "th" ? "th-TH" : "en-US")} <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{m.points}</span></p>}
      {stamps && (
        <div className="mt-7">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: stamps.required }).map((_, index) => (
              <span key={index} className={`size-5 rounded-full border ${index < stamps.current ? "border-emerald-600 bg-emerald-500 shadow-sm shadow-emerald-900/20 dark:border-emerald-300 dark:bg-emerald-400" : "border-zinc-300 dark:border-zinc-700"}`} />
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-500">{stamps.current} / {stamps.required} {m.stamps}</p>
        </div>
      )}
    </Card>
  );
}
