import Link from "next/link";
import { Bell, ChevronRight, Plus } from "lucide-react";
import { Brand } from "@/components/brand";
import { ProgramCard } from "@/components/program-card";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";

export default async function HomePage() {
  const locale = await getLocale();
  const m = messages[locale].home;
  return (
    <main className="px-5 py-6">
      <header>
        <div className="flex items-center justify-between">
          <Brand compact />
          <button aria-label="Notifications" className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><Bell className="size-5" /></button>
        </div>
        <div className="mt-7"><p className="text-sm text-zinc-500">{m.greeting}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{m.title}</h1></div>
      </header>
      <section className="mt-7 grid gap-3">
        <ProgramCard locale={locale} name="Kept Coffee" subtitle={m.untilFreeCoffee} balance={480} />
        <ProgramCard locale={locale} name="Noodle Shop" subtitle={m.stampCard} stamps={{ current: 6, required: 10 }} />
      </section>
      <Link href="/programs/new" className="mt-4 block"><Button variant="secondary" className="w-full gap-2"><Plus className="size-4"/>{m.createProgram}</Button></Link>
      <section className="mt-9">
        <div className="flex items-center justify-between"><h2 className="font-semibold">{m.recent}</h2><Link href="/activity" className="text-sm text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link></div>
        <div className="mt-3 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {[["+20", "Kept Coffee", m.pointsEarned], ["+1", "Hair Studio", m.stampReceived], ["-100", "Kept Coffee", m.rewardRedeemed]].map(([amount, name, note]) => (
            <div key={`${name}-${note}`} className="flex items-center gap-3 py-4"><div className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{amount}</div><div className="min-w-0 flex-1"><p className="font-medium">{name}</p><p className="text-sm text-zinc-500">{note}</p></div><ChevronRight className="size-4 text-zinc-400"/></div>
          ))}
        </div>
      </section>
    </main>
  );
}
