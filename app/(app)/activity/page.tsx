export const metadata = { title: "Activity" };

const rows = [
  ["Today", "+20 pts", "Kept Coffee", "Earned"],
  ["Today", "+1 stamp", "Hair Studio", "Visit"],
  ["Yesterday", "-100 pts", "Kept Coffee", "Free latte"],
];

export default function ActivityPage() {
  return <main className="px-5 py-6"><h1 className="text-3xl font-semibold tracking-[-0.04em]">Activity</h1><div className="mt-5 flex gap-2 text-sm">{["All","Earn","Redeem","Transfer","Stamp"].map((x,i)=><button key={x} className={`rounded-full px-4 py-2 ${i===0?"bg-zinc-950 text-white dark:bg-white dark:text-zinc-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{x}</button>)}</div><div className="mt-5 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{rows.map(([date,amount,name,note])=><div key={`${date}-${name}-${note}`} className="flex gap-3 py-4"><div className="flex-1"><p className="font-medium">{name}</p><p className="mt-1 text-sm text-zinc-500">{note} · {date}</p></div><p className="font-semibold">{amount}</p></div>)}</div></main>;
}
