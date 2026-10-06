import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Crown,
  Gift,
  Share2,
  Sparkles,
  TicketPercent,
  UserPlus,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

const copy = {
  th: {
    eyebrow: "เติบโตได้มากกว่าแต้ม",
    title: "เปลี่ยน Loyalty ให้เป็นเหตุผลที่ลูกค้าอยากกลับมา",
    description:
      "PumpPoint กำลังต่อยอดจากแต้มและสแตมป์ไปสู่ referral, coupon และ member tier โดยยังคง flow ที่เรียบง่ายเหมือนเดิม",
    preview: "Preview",
    referral: {
      title: "Referral",
      copy: "ให้สมาชิกชวนเพื่อน แล้วตั้งรางวัลสำหรับทั้งผู้ชวนและสมาชิกใหม่ได้",
      badge: "+50 pts ทั้งคู่",
      line1: "Nina ชวน Beam",
      line2: "Beam เข้าร่วมและสะสมครั้งแรก",
      result: "Referral reward unlocked",
    },
    coupon: {
      title: "Coupons",
      copy: "แจกคูปองแบบกำหนดวันหมดอายุ ใช้แต้มร่วมได้ และเก็บทุกสิทธิ์ไว้ใน Wallet เดียว",
      badge: "10% OFF",
      code: "WELCOME10",
      expiry: "ใช้ได้ถึง 31 ต.ค.",
      wallet: "เพิ่มใน Wallet แล้ว",
    },
    tier: {
      title: "Member Tiers",
      copy: "ให้ลูกค้าเห็นเส้นทางจาก Member ไป Silver, Gold และ VIP พร้อมเป้าหมายถัดไปที่เข้าใจง่าย",
      current: "Silver",
      next: "อีก 750 pts ถึง Gold",
      benefit: "โบนัสแต้ม +10%",
    },
    merchant: {
      eyebrow: "สำหรับร้านค้า",
      title: "ตั้ง Growth Loop ได้จากที่เดียว",
      bullets: ["กำหนด referral reward", "ออก coupon ตามแคมเปญ", "วาง tier progression สำหรับลูกค้าประจำ"],
      cta: "สร้างโปรแกรม",
    },
  },
  en: {
    eyebrow: "GROW BEYOND POINTS",
    title: "Turn loyalty into a reason to come back.",
    description:
      "PumpPoint is expanding beyond points and stamps with referral, coupon, and member-tier experiences while keeping the same lightweight flow.",
    preview: "Preview",
    referral: {
      title: "Referral",
      copy: "Let members invite friends and reward both the advocate and the new customer after a qualifying action.",
      badge: "+50 pts each",
      line1: "Nina invited Beam",
      line2: "Beam joined and collected once",
      result: "Referral reward unlocked",
    },
    coupon: {
      title: "Coupons",
      copy: "Issue expiring offers, combine them with loyalty rewards, and keep every benefit in one wallet.",
      badge: "10% OFF",
      code: "WELCOME10",
      expiry: "Valid until Oct 31",
      wallet: "Saved to wallet",
    },
    tier: {
      title: "Member Tiers",
      copy: "Show a clear path from Member to Silver, Gold, and VIP with a next milestone customers can understand.",
      current: "Silver",
      next: "750 pts to Gold",
      benefit: "+10% point bonus",
    },
    merchant: {
      eyebrow: "FOR BUSINESSES",
      title: "Shape the growth loop in one place.",
      bullets: ["Configure referral rewards", "Launch campaign coupons", "Design tier progression for loyal customers"],
      cta: "Create a program",
    },
  },
} as const;

export function GrowthLoyaltyPreview({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <section id="growth" className="landing-section mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="landing-reveal max-w-3xl">
        <p className="landing-eyebrow">{t.eyebrow}</p>
        <h2 className="landing-heading">{t.title}</h2>
        <p className="landing-subheading">{t.description}</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        <article className="landing-reveal rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_42px_rgba(15,45,70,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5" /></span>
            <span className="rounded-full border border-[#10C9A7]/25 bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#087F6E]">{t.preview}</span>
          </div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.referral.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.referral.copy}</p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-slate-50 p-4 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#0F2D46] text-white"><UserPlus className="size-4" /></span>
              <div className="min-w-0"><p className="truncate text-xs font-bold">{t.referral.line1}</p><p className="mt-1 text-[10px] text-slate-400">{t.referral.line2}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#E6FAF6] px-3 py-2.5 text-[#0F2D46]">
              <span className="text-[11px] font-semibold">{t.referral.result}</span>
              <span className="text-[11px] font-bold text-[#087F6E]">{t.referral.badge}</span>
            </div>
          </div>
        </article>

        <article className="landing-reveal rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_42px_rgba(15,45,70,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><TicketPercent className="size-5" /></span>
            <span className="rounded-full border border-amber-300/40 bg-[#FFF4D6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#8B6415]">{t.preview}</span>
          </div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.coupon.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.coupon.copy}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-[#FFF9E8] text-[#0F2D46]">
            <div className="flex items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#B7791F]">PumpPoint Coupon</p><p className="mt-2 text-2xl font-semibold tracking-[-.04em]">{t.coupon.badge}</p></div><BadgePercent className="size-8 text-[#B7791F]" /></div>
            <div className="border-t border-dashed border-amber-300 px-4 py-3"><div className="flex items-center justify-between text-[10px]"><span className="font-mono font-bold">{t.coupon.code}</span><span className="text-slate-500">{t.coupon.expiry}</span></div><p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#087F6E]"><Gift className="size-3" />{t.coupon.wallet}</p></div>
          </div>
        </article>

        <article className="landing-reveal rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_42px_rgba(15,45,70,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#EAF2FF] text-[#3B82F6]"><Crown className="size-5" /></span>
            <span className="rounded-full border border-blue-200 bg-[#EAF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#3B82F6]">{t.preview}</span>
          </div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.tier.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.tier.copy}</p>
          <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,#0F2D46,#123E5F)] p-4 text-white">
            <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">Member tier</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em]">{t.tier.current}</p></div><Sparkles className="size-6 text-[#72E5D0]" /></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-[#10C9A7]" /></div>
            <div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="text-white/55">{t.tier.next}</span><span className="rounded-full bg-white/10 px-2 py-1 font-bold text-[#72E5D0]">{t.tier.benefit}</span></div>
          </div>
        </article>
      </div>

      <div className="landing-reveal mt-6 grid gap-6 rounded-[28px] bg-[#0F2D46] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#72E5D0]">{t.merchant.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{t.merchant.title}</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">{t.merchant.bullets.map((item) => <p key={item} className="flex items-center gap-2 text-xs text-white/65"><span className="size-1.5 shrink-0 rounded-full bg-[#10C9A7]" />{item}</p>)}</div>
        </div>
        <Link href="/programs/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46] transition hover:-translate-y-px hover:bg-[#0EB99A]">{t.merchant.cta}<ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
}
