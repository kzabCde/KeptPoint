import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgePercent, Crown, Gift, Share2, Sparkles, Store } from "lucide-react";
import { claimCoupon, generateReferralCode } from "@/app/actions/growth";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getLocale } from "@/lib/preferences";
import { productMessages } from "@/lib/product-i18n";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Benefits · PumpPoint" };

type Tab = "rewards" | "coupons" | "tiers" | "referrals";

export default async function BenefitsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [locale, supabase, query] = await Promise.all([getLocale(), createClient(), searchParams]);
  const th = locale === "th";
  const t = productMessages[locale].benefits;
  const allowedTabs: Tab[] = ["rewards", "coupons", "tiers", "referrals"];
  const tab: Tab = allowedTabs.includes(query.tab as Tab) ? query.tab as Tab : "rewards";
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: memberships } = await supabase
    .from("program_members")
    .select("program_id,programs(id,name,slug,currency_name)")
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  const programs = (memberships ?? [])
    .map((row) => Array.isArray(row.programs) ? row.programs[0] : row.programs)
    .filter((program): program is NonNullable<typeof program> => Boolean(program));
  const programIds = programs.map((program) => program.id);
  const programMap = new Map(programs.map((program) => [program.id, program]));

  const empty = { data: [] as never[] };
  const [accountsResult, rewardsResult, rewardRedemptionsResult, couponsResult, couponClaimsResult, tiersResult, referralSettingsResult, codesResult, referralsResult] = programIds.length ? await Promise.all([
    supabase.from("point_accounts").select("program_id,balance,reserved_balance,lifetime_earned").eq("user_id", auth.user.id).in("program_id", programIds),
    supabase.from("rewards").select("id,program_id,name,description,reward_type,points_required,stamps_required,expires_at").in("program_id", programIds).eq("active", true).order("created_at", { ascending: false }),
    supabase.from("reward_redemptions").select("reward_id,status").eq("user_id", auth.user.id).in("program_id", programIds),
    supabase.from("coupons").select("id,program_id,code,name,description,discount_type,discount_value,expires_at").in("program_id", programIds).eq("active", true).order("created_at", { ascending: false }),
    supabase.from("coupon_redemptions").select("coupon_id,status").eq("user_id", auth.user.id).in("program_id", programIds),
    supabase.from("program_tiers").select("id,program_id,name,min_lifetime_earned,benefits").in("program_id", programIds).eq("active", true).order("min_lifetime_earned"),
    supabase.from("program_referral_settings").select("program_id,enabled,referrer_bonus,referred_bonus").in("program_id", programIds).eq("enabled", true),
    supabase.from("referral_codes").select("program_id,code").eq("user_id", auth.user.id).in("program_id", programIds),
    supabase.from("referrals").select("program_id,status").eq("referrer_id", auth.user.id).in("program_id", programIds),
  ]) : [empty, empty, empty, empty, empty, empty, empty, empty, empty];

  const accounts = new Map((accountsResult.data ?? []).map((row) => [row.program_id, row]));
  const rewardStates = new Map((rewardRedemptionsResult.data ?? []).map((row) => [row.reward_id, row.status]));
  const couponStates = new Map((couponClaimsResult.data ?? []).map((row) => [row.coupon_id, row.status]));
  const codes = new Map((codesResult.data ?? []).map((row) => [row.program_id, row.code]));
  const tiersByProgram = new Map<string, typeof tiersResult.data>();
  for (const tier of tiersResult.data ?? []) {
    const rows = tiersByProgram.get(tier.program_id) ?? [];
    rows.push(tier);
    tiersByProgram.set(tier.program_id, rows);
  }
  const referralsByProgram = new Map<string, { total: number; rewarded: number }>();
  for (const referral of referralsResult.data ?? []) {
    const stats = referralsByProgram.get(referral.program_id) ?? { total: 0, rewarded: 0 };
    stats.total += 1;
    if (referral.status === "rewarded") stats.rewarded += 1;
    referralsByProgram.set(referral.program_id, stats);
  }

  const tabs: { key: Tab; label: string; icon: typeof Gift }[] = [
    { key: "rewards", label: t.rewards, icon: Gift },
    { key: "coupons", label: t.coupons, icon: BadgePercent },
    { key: "tiers", label: t.tiers, icon: Crown },
    { key: "referrals", label: t.referrals, icon: Share2 },
  ];

  return (
    <main className="page-wrap min-w-0">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]"><Sparkles className="size-4" />{t.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{t.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{t.description}</p>
      </div>

      <nav className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.title}>
        {tabs.map(({ key, label, icon: Icon }) => <Link key={key} href={`/benefits?tab=${key}`} className={cn("inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold", tab === key ? "border-[#0F2D46] bg-[#0F2D46] text-white dark:border-[#10C9A7] dark:bg-[#10C9A7] dark:text-[#0F2D46]" : "border-[var(--border)] bg-[var(--surface)] text-slate-500")}><Icon className="size-4" />{label}</Link>)}
      </nav>

      {programs.length === 0 && <section className="cute-card mt-6 p-8 text-center shadow-none"><Store className="mx-auto size-9 text-slate-300" /><h2 className="mt-4 font-semibold">{th ? "ยังไม่มีสิทธิ์ในวอลเล็ต" : "No loyalty benefits yet"}</h2><p className="mt-2 text-sm text-slate-500">{th ? "เข้าร่วมโปรแกรมก่อน แล้วสิทธิ์ทั้งหมดจะรวมอยู่ที่นี่" : "Join a loyalty program and your benefits will appear here."}</p><Link href="/explore" className="cute-primary mt-5 inline-flex rounded-xl px-4 py-3 text-sm font-bold">{th ? "ค้นหาร้าน" : "Explore stores"}</Link></section>}

      {programs.length > 0 && tab === "rewards" && <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(rewardsResult.data ?? []).length === 0 && <EmptyState icon={Gift} title={th ? "ยังไม่มีรางวัล" : "No rewards yet"} copy={th ? "รางวัลจากร้านที่คุณเข้าร่วมจะมาอยู่ตรงนี้" : "Rewards from your programs will appear here."} />}
        {(rewardsResult.data ?? []).map((reward) => { const program = programMap.get(reward.program_id); const state = rewardStates.get(reward.id); const cost = reward.reward_type === "points" ? `${reward.points_required ?? 0} pts` : reward.reward_type === "stamps" ? `${reward.stamps_required ?? 0} ${th ? "สแตมป์" : "stamps"}` : (th ? "สิทธิ์จากร้าน" : "In-store benefit"); return <article key={reward.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5"><p className="truncate text-xs font-semibold text-slate-400">{program?.name ?? "PumpPoint"}</p><h2 className="mt-2 text-lg font-semibold">{reward.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{reward.description || cost}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="font-bold text-[#0F2D46] dark:text-white">{cost}</span><span className="rounded-full bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold text-[#087F6E]">{state === "completed" ? (th ? "แลกแล้ว" : "Redeemed") : state === "pending" || state === "reserved" ? (th ? "รอยืนยัน" : "Pending") : (th ? "พร้อมสะสม" : "Available")}</span></div><Link href={program?.slug ? `/programs/${program.slug}#rewards` : "/rewards"} className="cute-secondary mt-4 flex min-h-10 items-center justify-center rounded-xl text-xs font-bold">{th ? "ดูรายละเอียด" : "View details"}</Link></article>; })}
      </section>}

      {programs.length > 0 && tab === "coupons" && <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(couponsResult.data ?? []).length === 0 && <EmptyState icon={BadgePercent} title={th ? "ยังไม่มีคูปอง" : "No coupons yet"} copy={th ? "ข้อเสนอจากร้านที่คุณเข้าร่วมจะมาอยู่ตรงนี้" : "Offers from your programs will appear here."} />}
        {(couponsResult.data ?? []).map((coupon) => { const program = programMap.get(coupon.program_id); const state = couponStates.get(coupon.id); return <article key={coupon.id} className="rounded-[22px] border border-dashed border-amber-300 bg-[#FFF9E8] p-5 text-[#0F2D46]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#B7791F]">{program?.name ?? "PumpPoint"}</p><h2 className="mt-2 text-lg font-semibold">{coupon.name}</h2></div><BadgePercent className="size-6 shrink-0 text-[#B7791F]" /></div><p className="mt-2 font-mono text-xs font-bold">{coupon.code}</p><p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{coupon.description}</p>{coupon.expires_at && <p className="mt-3 text-[10px] text-slate-400">{th ? "หมดอายุ" : "Expires"} {new Date(coupon.expires_at).toLocaleDateString(th ? "th-TH" : "en-US")}</p>}{state ? <p className="mt-4 text-xs font-bold text-[#087F6E]">{state === "redeemed" ? (th ? "ใช้แล้ว ✓" : "Redeemed ✓") : (th ? "บันทึกใน Wallet แล้ว" : "Saved to wallet")}</p> : program ? <form action={claimCoupon.bind(null, coupon.id, program.slug)} className="mt-4"><PendingSubmitButton pendingLabel={th ? "กำลังบันทึก…" : "Saving…"} className="cute-primary min-h-10 w-full rounded-xl text-xs font-bold">{th ? "เก็บคูปอง" : "Save coupon"}</PendingSubmitButton></form> : null}</article>; })}
      </section>}

      {programs.length > 0 && tab === "tiers" && <section className="mt-6 grid gap-4 md:grid-cols-2">
        {programs.map((program) => { const rows = tiersByProgram.get(program.id) ?? []; if (!rows.length) return null; const lifetime = Number(accounts.get(program.id)?.lifetime_earned ?? 0); const current = [...rows].reverse().find((tier) => lifetime >= Number(tier.min_lifetime_earned)); const next = rows.find((tier) => Number(tier.min_lifetime_earned) > lifetime); const base = Number(current?.min_lifetime_earned ?? 0); const target = Number(next?.min_lifetime_earned ?? base || 1); const progress = next ? Math.max(0, Math.min(100, ((lifetime - base) / Math.max(1, target - base)) * 100)) : 100; return <article key={program.id} className="rounded-[24px] bg-[linear-gradient(135deg,#0F2D46,#123E5F)] p-5 text-white"><p className="text-xs font-semibold text-white/50">{program.name}</p><div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.14em] text-white/40">{th ? "ระดับปัจจุบัน" : "Current tier"}</p><h2 className="mt-1 text-2xl font-semibold">{current?.name ?? "Member"}</h2></div><p className="text-xs font-semibold text-[#72E5D0]">{lifetime.toLocaleString(th ? "th-TH" : "en-US")} lifetime pts</p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{ width: `${progress}%` }} /></div><p className="mt-3 text-xs text-white/55">{next ? (th ? `อีก ${Math.max(0, Number(next.min_lifetime_earned) - lifetime).toLocaleString("th-TH")} ถึง ${next.name}` : `${Math.max(0, Number(next.min_lifetime_earned) - lifetime).toLocaleString("en-US")} to ${next.name}`) : (th ? "ถึงระดับสูงสุดแล้ว" : "Top tier reached")}</p><Link href={`/programs/${program.slug}/growth`} className="mt-4 inline-flex text-xs font-bold text-[#72E5D0]">{th ? "ดูสิทธิ์ระดับสมาชิก →" : "View tier benefits →"}</Link></article>; })}
        {(tiersResult.data ?? []).length === 0 && <EmptyState icon={Crown} title={th ? "ยังไม่มีระดับสมาชิก" : "No member tiers yet"} copy={th ? "ร้านที่ตั้งระดับสมาชิกจะปรากฏตรงนี้" : "Programs with member tiers will appear here."} />}
      </section>}

      {programs.length > 0 && tab === "referrals" && <section className="mt-6 grid gap-4 md:grid-cols-2">
        {(referralSettingsResult.data ?? []).map((setting) => { const program = programMap.get(setting.program_id); if (!program) return null; const code = codes.get(setting.program_id); const stats = referralsByProgram.get(setting.program_id) ?? { total: 0, rewarded: 0 }; return <article key={setting.program_id} className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-5" /></span><div><h2 className="font-semibold">{program.name}</h2><p className="text-xs text-slate-500">+{setting.referrer_bonus} / +{setting.referred_bonus} pts</p></div></div>{code ? <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{th ? "โค้ดชวนเพื่อน" : "Invite code"}</p><p className="mt-2 font-mono text-2xl font-semibold tracking-[.08em]">{code}</p></div> : <form action={generateReferralCode.bind(null, setting.program_id, program.slug)} className="mt-5"><PendingSubmitButton pendingLabel={th ? "กำลังสร้าง…" : "Generating…"} className="cute-primary min-h-10 w-full rounded-xl text-xs font-bold">{th ? "สร้างโค้ดชวนเพื่อน" : "Generate invite code"}</PendingSubmitButton></form>}<div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5"><p className="text-xl font-semibold">{stats.total}</p><p className="text-[10px] text-slate-400">{th ? "ชวนแล้ว" : "Invited"}</p></div><div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-white/5"><p className="text-xl font-semibold">{stats.rewarded}</p><p className="text-[10px] text-slate-400">{th ? "สำเร็จ" : "Converted"}</p></div></div><Link href={`/programs/${program.slug}/growth`} className="cute-secondary mt-4 flex min-h-10 items-center justify-center rounded-xl text-xs font-bold">{th ? "จัดการ Referral ของฉัน" : "Open referral details"}</Link></article>; })}
        {(referralSettingsResult.data ?? []).length === 0 && <EmptyState icon={Share2} title={th ? "ยังไม่มี Referral ที่เปิดใช้" : "No referral programs yet"} copy={th ? "เมื่อร้านเปิด Referral คุณจะชวนเพื่อนจากหน้านี้ได้" : "When a program enables referrals, it will appear here."} />}
      </section>}
    </main>
  );
}

function EmptyState({ icon: Icon, title, copy }: { icon: typeof Gift; title: string; copy: string }) {
  return <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-7 text-center md:col-span-2"><Icon className="mx-auto size-8 text-slate-300" /><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 text-sm text-slate-500">{copy}</p></div>;
}
