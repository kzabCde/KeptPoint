import Image from "next/image";
import Link from "next/link";
import { ArrowRight, QrCode, Stamp, WalletCards } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";

export default async function LandingPage() {
  const locale = await getLocale();
  const m = messages[locale].landing;
  const features = [
    [WalletCards, m.pointTitle, m.pointCopy],
    [Stamp, m.stampTitle, m.stampCopy],
    [QrCode, m.scanTitle, m.scanCopy],
  ] as const;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Brand compact />
        <Link href="/login"><Button variant="secondary">{m.signIn}</Button></Link>
      </header>
      <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">{m.eyebrow}</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{m.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">{m.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/home"><Button className="gap-2">{m.openDemo} <ArrowRight className="size-4" /></Button></Link>
            <Link href="/programs/new"><Button variant="secondary">{m.createProgram}</Button></Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[38px] border border-emerald-900/10 bg-[linear-gradient(145deg,#063c35,#092f2a)] p-7 shadow-2xl shadow-emerald-950/15">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-300/20 blur-3xl"/>
          <Image src="/keptpoint-mark.svg" alt="" width={220} height={220} className="relative mx-auto drop-shadow-2xl"/>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            {features.map(([Icon, title, copy]) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                <Icon className="size-5 text-emerald-300"/><h2 className="mt-6 font-semibold">{title}</h2><p className="mt-2 text-xs leading-5 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
