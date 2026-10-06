import Link from "next/link";
import { ArrowLeft, BadgePercent, Crown, Share2 } from "lucide-react";
import { claimCoupon, claimReferral, generateReferralCode } from "@/app/actions/growth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { ReferralShare } from "@/components/referral-share";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { referralInvitePath } from "@/lib/share-links";

export default async function ProgramGrowthPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const th = (await getLocale()) === "th";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    const next = `/programs/${slug}/growth`;
    return <main className="mx-auto max-w-xl p-6"><Link href={`/login?next=${encodeURIComponent(next)}`} className="cute-primary inline-flex rounded-xl px-4 py-3 text-sm font-bold">{th ? "เข้าสู่ระบบเพื่อดูสิทธิ์" : "Sign in to view loyalty benefits"}</Link></main>;
  }
  const { data: program } = await supabase.from("programs").select("id,name,currency_name").eq("slug", slug).maybeSingle();
  if (!program) return <main className="mx-auto max-w-xl p-6 text-sm text-zinc-500">{th ? "ไม่พบโปรแกรมนี้" : "Program not found."}</main>;

  const [memberResult, accountResult, referralSettingsResult, codeResult, referralResult, couponsResult, claimsResult, tiersResult] = await Promise.all([
    supabase.from("program_members").select("status").eq("program_id", program.id).eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("point_accounts").select("lifetime_earned").eq("program_id", program.id).eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("program_referral_settings").select("enabled,referrer_bonus,referred_bonus").eq("program_id", program.id).maybeSingle(),
    supabase.from("referral_codes").select("code").eq("program_id", program.id).eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("referrals").select("status,referrer_id").eq("program_id", program.id).eq("referred_id", auth.user.id).maybeSingle(),
    supabase.from("coupons").select("id,code,name,description,discount_type,discount_value,max_per_user,expires_at").eq("program_id", program.id).eq("active", true).order("created_at", { ascending: false }),
    supabase.from("coupon_redemptions").select("coupon_id,status").eq("program_id", program.id).eq("user_id", auth.user.id).in("status", ["claimed","redeemed"]),
    supabase.from("program_tiers").select("id,name,min_lifetime_earned,benefits").eq("program_id", program.id).eq("active", true).order("min_lifetime_earned"),
  ]);
  const member = memberResult.data;
  const lifetime = Number(accountResult.data?.lifetime_earned ?? 0);
  const settings = referralSettingsResult.data;
  const code = codeResult.data?.code;
  const referral = referralResult.data;
  const coupons = couponsResult.data ?? [];
  const claims = claimsResult.data ?? [];
  const tiers = tiersResult.data ?? [];
  const currentTier = [...tiers].reverse().find((tier) => lifetime >= Number(tier.min_lifetime_earned));
  const nextTier = tiers.find((tier) => Number(tier.min_lifetime_earned) > lifetime);
  const progressBase = currentTier ? Number(currentTier.min_lifetime_earned) : 0;
  const progressTarget = nextTier ? Number(nextTier.min_lifetime_earned) : progressBase || 1;
  const progress = nextTier ? Math.max(0, Math.min(100, ((lifetime-progressBase)/(progressTarget-progressBase))*100)) : 100;

  return <main className="mx-auto min-h-dvh max-w-4xl px-5 py-6 sm:px-8 lg:py-10">
    <div className="flex items-center justify-between"><Link href={`/programs/${slug}`} className="cute-icon-button" aria-label={th ? "กลับ" : "Back"}><ArrowLeft className="size-4"/></Link><p className="text-sm font-semibold">{program.name}</p></div>
    <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-700 dark:text-emerald-300">Benefits</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "สิทธิ์ที่มากกว่าแต้ม" : "More than points"}</h1><p className="mt-3 text-sm leading-6 text-zinc-500">{th ? "ชวนเพื่อน เก็บคูปอง และดูระดับสมาชิกของคุณจากที่เดียว" : "Invite friends, save coupons, and track your member tier in one place."}</p></div>

    {member?.status !== "active" ? <section className="cute-card mt-7 p-6"><p className="font-semibold">{th ? "เข้าร่วมโปรแกรมก่อนเพื่อใช้สิทธิ์" : "Join the program to use these benefits."}</p><Link href={`/programs/${slug}`} className="cute-primary mt-4 inline-flex rounded-xl px-4 py-3 text-sm font-bold">{th ? "กลับไปเข้าร่วม" : "Join program"}</Link></section> : <>
      <section id="referral" className="mt-7 scroll-mt-24 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5"/></span><div><h2 className="font-semibold">Referral</h2>{settings?.enabled && <p className="text-xs text-zinc-500">+{settings.referrer_bonus} / +{settings.referred_bonus} pts</p>}</div></div>
        {!settings?.enabled ? <p className="mt-4 text-sm text-zinc-500">{th ? "ร้านยังไม่ได้เปิด Referral" : "Referrals are not enabled yet."}</p> : <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
            <p className="text-xs font-bold text-zinc-500">{th ? "ลิงก์ชวนเพื่อนของคุณ" : "Your referral link"}</p>
            {code ? <><p className="mt-2 font-mono text-2xl font-semibold tracking-[.08em]">{code}</p><ReferralShare path={referralInvitePath(program.id, slug, code)} copyLabel={th ? "คัดลอกลิงก์" : "Copy link"} shareLabel={th ? "แชร์" : "Share"} copiedLabel={th ? "คัดลอกแล้ว" : "Copied"}/><p className="mt-3 text-[11px] leading-5 text-zinc-500">{th ? "ลิงก์นี้ผูกกับ Store ID ของร้านนี้โดยตรง เพื่อนสามารถเป็นสมาชิกหลายร้านด้วยบัญชีเดิมได้" : "This link is scoped directly to this store ID. Friends can join multiple stores with the same account."}</p></> : <form action={generateReferralCode.bind(null,program.id,slug)} className="mt-3"><PendingSubmitButton pendingLabel={th ? "กำลังสร้าง…" : "Generating…"} className="cute-primary rounded-xl px-3 py-2 text-xs font-bold">{th ? "สร้างลิงก์ Referral" : "Generate referral link"}</PendingSubmitButton></form>}
          </div>
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-white/5"><p className="text-xs font-bold text-zinc-500">{th ? "มีโค้ดจากเพื่อน?" : "Have a friend's code?"}</p>{referral ? <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{referral.status === "rewarded" ? (th ? "รับโบนัสแล้ว ✓" : "Rewarded ✓") : (th ? "รอการสะสมครั้งแรก" : "Waiting for first qualifying earn")}</p> : <form action={claimReferral.bind(null,program.id,slug)} className="mt-3 flex gap-2"><input required name="code" minLength={8} maxLength={16} placeholder="ABC12345" className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm uppercase"/><PendingSubmitButton pendingLabel="…" className="cute-primary rounded-xl px-3 text-xs font-bold">{th ? "ใช้โค้ด" : "Apply"}</PendingSubmitButton></form>}</div>
        </div>}
      </section>
      <section id="coupons" className="mt-6 scroll-mt-24 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><BadgePercent className="size-5"/></span><h2 className="font-semibold">Coupons</h2></div><div className="mt-5 grid gap-3 md:grid-cols-2">{coupons.length===0 && <p className="text-sm text-zinc-500">{th ? "ยังไม่มีคูปองที่ใช้ได้" : "No active coupons right now."}</p>}{coupons.map((coupon) => { const claim = claims.find((item) => item.coupon_id===coupon.id); return <div key={coupon.id} className="rounded-2xl border border-dashed border-amber-300 bg-[#FFF9E8] p-4 text-[#0F2D46]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{coupon.name}</p><p className="mt-1 font-mono text-xs text-[#B7791F]">{coupon.code}</p></div><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold">{coupon.discount_type}{coupon.discount_value == null ? "" : ` ${coupon.discount_value}`}</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{coupon.description}</p>{coupon.expires_at && <p className="mt-2 text-[10px] text-slate-400">{th ? "หมดอายุ" : "Expires"} {new Date(coupon.expires_at).toLocaleDateString(th ? "th-TH" : "en-US")}</p>}{claim ? <p className="mt-4 text-xs font-bold text-[#087F6E]">{claim.status === "redeemed" ? (th ? "ใช้แล้ว ✓" : "Redeemed ✓") : (th ? "บันทึกใน Wallet แล้ว" : "Saved to wallet")}</p> : <form action={claimCoupon.bind(null,coupon.id,slug)} className="mt-4"><PendingSubmitButton pendingLabel={th ? "กำลังบันทึก…" : "Saving…"} className="cute-primary w-full rounded-xl px-3 py-2 text-xs font-bold">{th ? "เก็บคูปอง" : "Save coupon"}</PendingSubmitButton></form>}</div>;})}</div></section>
      <section id="tier" className="mt-6 scroll-mt-24 rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#EAF2FF] text-blue-600"><Crown className="size-5"/></span><div><h2 className="font-semibold">Member tier</h2><p className="text-xs text-zinc-500">{lifetime.toLocaleString(th ? "th-TH" : "en-US")} lifetime {program.currency_name}</p></div></div>{tiers.length===0 ? <p className="mt-4 text-sm text-zinc-500">{th ? "ร้านยังไม่ได้ตั้งระดับสมาชิก" : "This program has not configured tiers yet."}</p> : <div className="mt-5 rounded-2xl bg-[linear-gradient(135deg,#0F2D46,#123E5F)] p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">{th ? "ระดับปัจจุบัน" : "Current tier"}</p><p className="mt-1 text-2xl font-semibold">{currentTier?.name ?? "Member"}</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{ width: `${progress}%` }}/></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/55"><span>{nextTier ? (th ? `อีก ${Math.max(0,Number(nextTier.min_lifetime_earned)-lifetime).toLocaleString("th-TH")} ถึง ${nextTier.name}` : `${Math.max(0,Number(nextTier.min_lifetime_earned)-lifetime).toLocaleString("en-US")} to ${nextTier.name}`) : (th ? "ถึงระดับสูงสุดแล้ว" : "Top tier reached")}</span>{currentTier && Array.isArray(currentTier.benefits) && currentTier.benefits.length>0 && <span className="rounded-full bg-white/10 px-2 py-1 font-bold text-[#72E5D0]">{String(currentTier.benefits[0])}</span>}</div></div>}</section>
    </>}
  </main>;
}
