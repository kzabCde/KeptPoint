import Link from "next/link";
import { ArrowRight, QrCode, Stamp, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">K</span>Keptpoint</div>
        <Link href="/login"><Button variant="secondary">Sign in</Button></Link>
      </header>
      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-zinc-500">Universal loyalty wallet</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Your points, kept.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">Create, join, scan, collect and redeem. One account works for customers, friends, communities and businesses.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/home"><Button className="gap-2">Open demo <ArrowRight className="size-4" /></Button></Link>
            <Link href="/programs/new"><Button variant="secondary">Create a program</Button></Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[
            [WalletCards, "Points", "Collect balances from every program."],
            [Stamp, "Stamps", "Digital cards with rounds and rewards."],
            [QrCode, "Scan", "Short-lived QR flows for earning and redeeming."],
          ].map(([Icon, title, copy]) => {
            const C = Icon as typeof WalletCards;
            return <div key={String(title)} className="rounded-[28px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><C className="size-6"/><h2 className="mt-8 font-semibold">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{String(copy)}</p></div>;
          })}
        </div>
      </section>
    </main>
  );
}
