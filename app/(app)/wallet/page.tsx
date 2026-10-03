import { Search } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Wallet" };

export default async function WalletPage() {
  const locale = await getLocale();
  const m = messages[locale].wallet;
  const c = messages[locale].common;
  const filters = [c.all, m.points, m.stamps, m.rewards, m.favorites];
  return (
    <main className="px-5 py-6">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1>
      <label className="mt-5 flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"><Search className="size-4 text-zinc-400"/><input className="w-full bg-transparent text-sm outline-none" placeholder={m.search} /></label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm">{filters.map((x,i)=><button key={x} className={`shrink-0 rounded-full px-4 py-2 ${i===0?"bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{x}</button>)}</div>
      <div className="mt-5 grid gap-3"><ProgramCard locale={locale} name="Kept Coffee" subtitle={m.points} balance={480}/><ProgramCard locale={locale} name="Noodle Shop" subtitle={m.stampCard} stamps={{current:6,required:10}}/><ProgramCard locale={locale} name="Barber Club" subtitle={m.points} balance={220}/></div>
    </main>
  );
}
