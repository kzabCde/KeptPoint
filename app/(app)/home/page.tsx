import Link from "next/link";
import { Bell, ChevronRight, Plus } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="px-5 py-6">
      <header className="flex items-center justify-between">
        <div><p className="text-sm text-zinc-500">Good afternoon</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Your rewards</h1></div>
        <button aria-label="Notifications" className="grid size-11 place-items-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><Bell className="size-5" /></button>
      </header>
      <section className="mt-7 grid gap-3">
        <ProgramCard name="Kept Coffee" subtitle="120 pts until free coffee" balance={480} />
        <ProgramCard name="Noodle Shop" subtitle="Stamp card" stamps={{ current: 6, required: 10 }} />
      </section>
      <Link href="/programs/new" className="mt-4 block"><Button variant="secondary" className="w-full gap-2"><Plus className="size-4"/>Create program</Button></Link>
      <section className="mt-9">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link href="/activity" className="text-sm text-zinc-500">See all</Link></div>
        <div className="mt-3 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {[["+20", "Kept Coffee", "Points earned"], ["+1", "Hair Studio", "Stamp received"], ["-100", "Kept Coffee", "Reward redeemed"]].map(([amount, name, note]) => (
            <div key={`${name}-${note}`} className="flex items-center gap-3 py-4"><div className="grid size-11 place-items-center rounded-2xl bg-zinc-100 text-sm font-semibold dark:bg-zinc-900">{amount}</div><div className="min-w-0 flex-1"><p className="font-medium">{name}</p><p className="text-sm text-zinc-500">{note}</p></div><ChevronRight className="size-4 text-zinc-400"/></div>
          ))}
        </div>
      </section>
    </main>
  );
}
