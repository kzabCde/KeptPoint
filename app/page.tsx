import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, Gift, QrCode, Stamp, WalletCards } from "lucide-react";
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
    <main className="mx-auto min-h-dvh max-w-6xl px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <Brand compact />
        <Link href="/login"><Button variant="secondary">{m.signIn}</Button></Link>
      </header>
      <section className="grid min-h-[calc(100dvh-96px)] items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-[#087F6E]">{m.eyebrow}</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{m.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">{m.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/home"><Button className="gap-2">{m.openDemo} <ArrowRight className="size-4" /></Button></Link>
            <Link href="/programs/new"><Button variant="secondary">{m.createProgram}</Button></Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[24px] border border-slate-900/10 bg-[linear-gradient(145deg,#0F2D46,#123E5F)] p-7 shadow-2xl shadow-slate-950/15">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-[#10C9A7]/20 blur-3xl"/>
          <Image src="/pumppoint-mark.svg" alt="PumpPoint logo" width={256} height={256} priority className="relative mx-auto w-[220px] drop-shadow-2xl"/>
          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            {features.map(([Icon, title, copy]) => (
              <div key={title} className="rounded-[22px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                <Icon className="size-5 text-emerald-300"/><h2 className="mt-6 font-semibold">{title}</h2><p className="mt-2 text-xs leading-5 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-16" aria-labelledby="how-it-works">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-[#087F6E]">{locale === "th" ? "ใช้ง่ายใน 3 ขั้นตอน" : "Simple by design"}</p>
        <h2 id="how-it-works" className="mt-2 text-3xl font-semibold tracking-[-0.045em]">{locale === "th" ? "สแกน · สะสม · รับรางวัล" : "Scan. Collect. Reward."}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{features.map(([Icon, title, copy], index) => <article key={title} className="cute-card p-6 shadow-none"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-[#E6FAF6] text-[#087F6E]"><Icon className="size-5" /></span><span className="text-xs font-bold text-slate-300">0{index + 1}</span></div><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></article>)}</div>
      </section>

      <section className="grid gap-8 rounded-[24px] bg-[#0F2D46] p-7 text-white sm:p-10 lg:grid-cols-[1fr_.85fr] lg:items-center">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#72E5D0]">PumpPoint for Business</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{locale === "th" ? "เปลี่ยนทุกการแวะมา ให้มีเหตุผลที่อยากกลับมาอีก" : "Turn every visit into a reason to come back."}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{locale === "th" ? "สร้างระบบแต้ม บัตรสแตมป์ รางวัล และดูแลสมาชิกได้จากแดชบอร์ดเดียว โดยไม่ต้องตั้งระบบให้ซับซ้อน" : "Run points, stamp cards, rewards, and member engagement from one focused dashboard — without complicated setup."}</p><Link href="/programs/new" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#10C9A7] px-5 text-sm font-bold text-[#0F2D46]">{locale === "th" ? "เริ่มสร้างโปรแกรม" : "Become a partner"}<ArrowRight className="size-4" /></Link></div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">{[[Gift, locale === "th" ? "รางวัลยืดหยุ่น" : "Flexible rewards"], [QrCode, locale === "th" ? "QR พร้อมใช้" : "Fast QR collection"], [BarChart3, locale === "th" ? "ภาพรวมลูกค้า" : "Clear customer insights"]].map(([Icon, label]) => { const IconComponent = Icon as typeof Gift; return <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><CheckCircle2 className="size-5 shrink-0 text-[#FBBF24]" /><IconComponent className="size-5 shrink-0 text-[#72E5D0]" /><span className="text-sm font-semibold">{String(label)}</span></div>; })}</div>
      </section>

      <footer className="mt-16 flex flex-col gap-4 border-t border-[var(--border)] py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><Brand compact /><p>© 2026 PumpPoint · Collect. Reward. Go Further.</p></footer>
    </main>
  );
}
