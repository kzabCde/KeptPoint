import Link from "next/link";
import { ArrowRight, BadgePercent, Crown, Gift, Share2, Sparkles, TicketPercent, UserPlus } from "lucide-react";
import type { Locale } from "@/lib/i18n";

const copy = {
  th: {
    eyebrow: "LOYALTY ที่มากกว่าแต้ม",
    title: "ครบทั้งสะสม รักษาลูกค้า และสร้างการกลับมาใช้ซ้ำ",
    description: "Referral, Coupon และ Member Tier ใช้งานจริงใน PumpPoint แล้ว และทำงานร่วมกับแต้ม สแตมป์ รางวัล และ Wallet ใน flow เดียวกัน",
    live: "พร้อมใช้งาน",
    referral: {
      title: "Referral",
      copy: "สมาชิกชวนเพื่อนได้ พร้อมตั้งโบนัสให้ทั้งผู้ชวนและสมาชิกใหม่หลังการสะสมครั้งแรกที่ผ่านเงื่อนไข",
      badge: "+50 pts ทั้งคู่",
      line1: "Nina ชวน Beam",
      line2: "Beam เข้าร่วมและสะสมครั้งแรก",
      result: "Referral reward unlocked",
    },
    coupon: {
      title: "Coupons",
      copy: "ร้านสร้างข้อเสนอ กำหนดจำนวนสิทธิ์ วันหมดอายุ และข้อจำกัดต่อสมาชิกได้ ลูกค้าเก็บสิทธิ์ไว้ใช้ภายหลัง",
      badge: "10% OFF",
      code: "WELCOME10",
      expiry: "ใช้ได้ถึง 31 ต.ค.",
      wallet: "บันทึกใน Wallet แล้ว",
    },
    tier: {
      title: "Member Tiers",
      copy: "ระดับสมาชิกคำนวณจาก Lifetime points จริง ลูกค้าจึงเห็นเป้าหมายและความคืบหน้าโดยไม่ปะปนกับแต้มคงเหลือ",
      current: "Silver",
      next: "อีก 750 pts ถึง Gold",
      benefit: "Birthday reward",
    },
    merchant: {
      eyebrow: "BUSINESS WORKSPACE",
      title: "จัด Loyalty และ Growth จากพื้นที่เดียว",
      bullets: ["Referral พร้อม conversion", "Coupon พร้อม claim / redemption", "Tier progression จาก Lifetime points"],
      cta: "สร้างโปรแกรม",
    },
  },
  en: {
    eyebrow: "LOYALTY BEYOND POINTS",
    title: "Collect, retain, and give customers a reason to return.",
    description: "Referrals, coupons, and member tiers are live PumpPoint features that work alongside points, stamps, rewards, and the customer wallet.",
    live: "Live",
    referral: {
      title: "Referral",
      copy: "Members can invite friends while businesses reward both sides after the new member completes a qualifying first earn.",
      badge: "+50 pts each",
      line1: "Nina invited Beam",
      line2: "Beam joined and collected once",
      result: "Referral reward unlocked",
    },
    coupon: {
      title: "Coupons",
      copy: "Create offers with allocations, expiry dates, and per-member limits, then let customers save them for later use.",
      badge: "10% OFF",
      code: "WELCOME10",
      expiry: "Valid until Oct 31",
      wallet: "Saved to wallet",
    },
    tier: {
      title: "Member Tiers",
      copy: "Tiers use real lifetime points earned, keeping long-term status separate from the customer's spendable point balance.",
      current: "Silver",
      next: "750 pts to Gold",
      benefit: "Birthday reward",
    },
    merchant: {
      eyebrow: "BUSINESS WORKSPACE",
      title: "Manage loyalty and growth in one place.",
      bullets: ["Referral conversion tracking", "Coupon claims and redemption", "Tier progression from lifetime points"],
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
          <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5" /></span><span className="rounded-full bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold text-[#087F6E]">{t.live}</span></div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.referral.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.referral.copy}</p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-slate-50 p-4 dark:bg-white/5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#0F2D46] text-white"><UserPlus className="size-4" /></span><div className="min-w-0"><p className="truncate text-xs font-bold">{t.referral.line1}</p><p className="mt-1 text-[10px] text-slate-400">{t.referral.line2}</p></div></div><div className="mt-4 flex items-center justify-between rounded-xl bg-[#E6FAF6] px-3 py-2.5 text-[#0F2D46]"><span className="text-[11px] font-semibold">{t.referral.result}</span><span className="text-[11px] font-bold text-[#087F6E]">{t.referral.badge}</span></div></div>
        </article>

        <article className="landing-reveal rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_42px_rgba(15,45,70,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><TicketPercent className="size-5" /></span><span className="rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[10px] font-bold text-[#8B6415]">{t.live}</span></div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.coupon.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.coupon.copy}</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-[#FFF9E8] text-[#0F2D46]"><div className="flex items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#B7791F]">PumpPoint Coupon</p><p className="mt-2 text-2xl font-semibold tracking-[-.04em]">{t.coupon.badge}</p></div><BadgePercent className="size-8 text-[#B7791F]" /></div><div className="border-t border-dashed border-amber-300 px-4 py-3"><div className="flex items-center justify-between text-[10px]"><span className="font-mono font-bold">{t.coupon.code}</span><span className="text-slate-500">{t.coupon.expiry}</span></div><p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#087F6E]"><Gift className="size-3" />{t.coupon.wallet}</p></div></div>
        </article>

        <article className="landing-reveal rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_42px_rgba(15,45,70,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#EAF2FF] text-[#3B82F6]"><Crown className="size-5" /></span><span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[10px] font-bold text-[#3B82F6]">{t.live}</span></div>
          <h3 className="mt-6 text-xl font-semibold tracking-[-.03em]">{t.tier.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t.tier.copy}</p>
          <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,#0F2D46,#123E5F)] p-4 text-white"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">Member tier</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em]">{t.tier.current}</p></div><Sparkles className="size-6 text-[#72E5D0]" /></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-[#10C9A7]" /></div><div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="text-white/55">{t.tier.next}</span><span className="rounded-full bg-white/10 px-2 py-1 font-bold text-[#72E5D0]">{t.tier.benefit}</span></div></div>
        </article>
      </div>

      <div className="landing-reveal mt-6 grid gap-6 rounded-[28px] bg-[#0F2D46] p-6 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#72E5D0]">{t.merchant.eyebrow}</p><h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{t.merchant.title}</h3><div className="mt-5 grid gap-2 sm:grid-cols-3">{t.merchant.bullets.map((item) => <p key={item} className="flex items-center gap-2 text-xs text-white/65"><span className="size-1.5 shrink-0 rounded-full bg-[#10C9A7]" />{item}</p>)}</div></div><Link href="/programs/new" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-4 text-sm font-bold text-[#0F2D46] transition hover:-translate-y-px hover:bg-[#0EB99A]">{t.merchant.cta}<ArrowRight className="size-4" /></Link></div>
    </section>
  );
}
