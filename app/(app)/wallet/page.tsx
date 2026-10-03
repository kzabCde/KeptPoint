import { Search } from "lucide-react";
import { ProgramCard } from "@/components/program-card";

export const metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <main className="px-5 py-6">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Wallet</h1>
      <label className="mt-5 flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900"><Search className="size-4 text-zinc-400"/><input className="w-full bg-transparent text-sm outline-none" placeholder="Search programs" /></label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm">{["All", "Points", "Stamps", "Rewards", "Favorites"].map((x,i)=><button key={x} className={`shrink-0 rounded-full px-4 py-2 ${i===0?"bg-zinc-950 text-white dark:bg-white dark:text-zinc-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{x}</button>)}</div>
      <div className="mt-5 grid gap-3"><ProgramCard name="Kept Coffee" subtitle="Points" balance={480}/><ProgramCard name="Noodle Shop" subtitle="Stamp card" stamps={{current:6,required:10}}/><ProgramCard name="Barber Club" subtitle="Points" balance={220}/></div>
    </main>
  );
}
