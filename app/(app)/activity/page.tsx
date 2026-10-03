import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const locale = await getLocale();
  const m = messages[locale].activity;
  const c = messages[locale].common;
  const rows = [
    [m.today, "+20", "Kept Coffee", m.earned, c.points],
    [m.today, "+1", "Hair Studio", m.visit, c.stamps],
    [m.yesterday, "-100", "Kept Coffee", m.freeLatte, c.points],
  ];
  const filters = [c.all, m.earn, m.redeem, m.transfer, m.stamp];
  return <main className="px-5 py-6"><h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><div className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm">{filters.map((x,i)=><button key={x} className={`shrink-0 rounded-full px-4 py-2 ${i===0?"bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{x}</button>)}</div><div className="mt-5 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{rows.map(([date,amount,name,note,unit])=><div key={`${date}-${name}-${note}`} className="flex gap-3 py-4"><div className="flex-1"><p className="font-medium">{name}</p><p className="mt-1 text-sm text-zinc-500">{note} · {date}</p></div><p className="font-semibold text-emerald-700 dark:text-emerald-300">{amount} {unit}</p></div>)}</div></main>;
}
