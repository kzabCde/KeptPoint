import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgePercent, ChevronRight, Crown, Gift, QrCode, Share2, Sparkles, WalletCards } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const locale = await getLocale();
  const m = messages[locale].home;
  const th = locale === "th";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const user = auth.user;

  const [{ data: profile }, { data: memberships }, { data: accounts }, { data: stampRows }, { data: pointTx }, { data: stampTx }] = await Promise.all([
    supabase.from("profiles").select("display_name,username").eq("id", user.id).maybeSingle(),
    supabase.from("program_members").select("program_id,status,programs(id,name,slug,program_type,currency_name)").eq("user_id", user.id).eq("status", "active").order("joined_at", { ascending: false }),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance,lifetime_earned").eq("user_id", user.id),
    supabase.from("stamp_progress").select("program_id,stamp_count,status,stamp_cards(required_stamps)").eq("user_id", user.id).in("status", ["active","completed","reserved"]).order("round", { ascending: false }),
    supabase.from("point_transactions").select("id,program_id,amount,type,created_at,programs(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("stamp_transactions").select("id,program_id,amount,type,created_at,programs(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
  ]);

  const programs = (memberships ?? []).map((membership) => Array.isArray(membership.programs) ? membership.programs[0] : membership.programs).filter((program): program is NonNullable<typeof program> => Boolean(program));
  const programIds = programs.map((program) => program.id);
  const empty = { data: [] as never[] };
  const [rewardsResult, couponClaimsResult, couponsResult, tiersResult, referralSettingsResult] = programIds.length ? await Promise.all([
    supabase.from("rewards").select("id,program_id,points_required,stamps_required,reward_type").in("program_id", programIds).eq("active", true),
    supabase.from("coupon_redemptions").select("coupon_id,program_id,status").eq("user_id", user.id).in("program_id", programIds).eq("status", "claimed"),
    supabase.from("coupons").select("id,program_id").in("program_id", programIds).eq("active", true),
    supabase.from("program_tiers").select("program_id,name,min_lifetime_earned").in("program_id", programIds).eq("active", true).order("min_lifetime_earned"),
    supabase.from("program_referral_settings").select("program_id,enabled,referrer_bonus,referred_bonus").in("program_id", programIds).eq("enabled", true),
  ]) : [empty, empty, empty, empty, empty];

  const accountMap = new Map((accounts ?? []).map((row) => [row.program_id, row]));
  const stampMap = new Map<string, { stamp_count: number; required: number }>();
  for (const row of stampRows ?? []) {
    if (stampMap.has(row.program_id)) continue;
    const card = Array.isArray(row.stamp_cards) ? row.stamp_cards[0] : row.stamp_cards;
    stampMap.set(row.program_id, { stamp_count: row.stamp_count, required: card?.required_stamps ?? 0 });
  }
  const totalAvailablePoints = programs.reduce((sum, program) => {
    if (program.program_type === "stamps") return sum;
    const account = accountMap.get(program.id);
    return sum + Math.max(0, Number(account?.balance ?? 0) - Number(account?.reserved_balance ?? 0));
  }, 0);

  const couponClaimedIds = new Set((couponClaimsResult.data ?? []).map((row) => row.coupon_id));
  const availableCouponCount = (couponsResult.data ?? []).filter((coupon) => !couponClaimedIds.has(coupon.id)).length;
  const rewardsCount = (rewardsResult.data ?? []).length;
  const tiersByProgram = new Map<string, typeof tiersResult.data>();
  for (const tier of tiersResult.data ?? []) { const rows = tiersByProgram.get(tier.program_id) ?? []; rows.push(tier); tiersByProgram.set(tier.program_id, rows); }
  const tierHighlight = programs.map((program) => {
    const rows = tiersByProgram.get(program.id) ?? [];
    if (!rows.length) return null;
    const lifetime = Number(accountMap.get(program.id)?.lifetime_earned ?? 0);
    const current = [...rows].reverse().find((tier) => lifetime >= Number(tier.min_lifetime_earned));
    const next = rows.find((tier) => Number(tier.min_lifetime_earned) > lifetime);
    return { program, lifetime, current, next };
  }).find(Boolean);
  const referral = (referralSettingsResult.data ?? [])[0];
  const referralProgram = referral ? programs.find((program) => program.id === referral.program_id) : null;

  const activity = [
    ...(pointTx ?? []).map((row) => ({ id: row.id, amount: row.amount, name: (Array.isArray(row.programs) ? row.programs[0] : row.programs)?.name ?? "PumpPoint", note: row.type, created_at: row.created_at, unit: th ? "แต้ม" : "pts" })),
    ...(stampTx ?? []).map((row) => ({ id: row.id, amount: row.amount, name: (Array.isArray(row.programs) ? row.programs[0] : row.programs)?.name ?? "PumpPoint", note: row.type, created_at: row.created_at, unit: th ? "สแตมป์" : "stamps" })),
  ].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,3);

  const firstName = profile?.display_name?.trim() || profile?.username || user.email?.split("@")[0] || (th ? "เพื่อน PumpPoint" : "PumpPoint friend");

  return (
    <main className="page-wrap min-w-0">
      <section>
        <p className="text-sm font-medium text-slate-400">{m.greeting}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em] sm:text-3xl">{firstName} 👋</h1>
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#0F2D46_0%,#123E5F_55%,#087F6E_100%)] p-6 text-white shadow-[0_18px_48px_rgba(15,45,70,.16)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#72E5D0]">{th ? "Loyalty ของคุณ" : "Your loyalty"}</p><p className="mt-3 text-5xl font-semibold tracking-[-.06em]">{totalAvailablePoints.toLocaleString(th ? "th-TH" : "en-US")} <span className="text-sm tracking-normal text-white/50">pts</span></p><p className="mt-2 text-sm text-white/55">{programs.length} {th ? "โปรแกรมในวอลเล็ต" : "programs in your wallet"}</p></div>
          {tierHighlight && <div className="rounded-2xl bg-white/10 p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#72E5D0]"><Crown className="size-4" />{tierHighlight.program.name}</div><p className="mt-2 text-xl font-semibold">{tierHighlight.current?.name ?? "Member"}</p><p className="mt-1 text-xs text-white/50">{tierHighlight.next ? (th ? `อีก ${Math.max(0, Number(tierHighlight.next.min_lifetime_earned)-tierHighlight.lifetime).toLocaleString("th-TH")} ถึง ${tierHighlight.next.name}` : `${Math.max(0, Number(tierHighlight.next.min_lifetime_earned)-tierHighlight.lifetime).toLocaleString("en-US")} to ${tierHighlight.next.name}`) : (th ? "ระดับสูงสุด" : "Top tier")}</p></div>}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-lg">
          <Link href="/scan" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10C9A7] px-3 text-sm font-bold text-[#0F2D46]"><QrCode className="size-4" />{th ? "สแกน" : "Scan"}</Link>
          <Link href="/wallet" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-bold"><WalletCards className="size-4" />{th ? "วอลเล็ต" : "Wallet"}</Link>
          <Link href={referralProgram ? `/programs/${referralProgram.slug}/growth` : "/benefits?tab=referrals"} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-bold"><Share2 className="size-4" />{th ? "ชวนเพื่อน" : "Invite"}</Link>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/benefits?tab=rewards" className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-amber-300"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-2xl bg-reward-soft text-amber-700"><Gift className="size-5" /></span><span className="text-2xl font-semibold">{rewardsCount}</span></div><p className="mt-4 font-semibold">{th ? "รางวัล" : "Rewards"}</p><p className="mt-1 text-xs text-slate-500">{th ? "ดูรางวัลจากร้านที่คุณเข้าร่วม" : "See rewards across your programs"}</p></Link>
        <Link href="/benefits?tab=coupons" className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-amber-300"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-2xl bg-[#FFF4D6] text-[#B7791F]"><BadgePercent className="size-5" /></span><span className="text-2xl font-semibold">{availableCouponCount}</span></div><p className="mt-4 font-semibold">{th ? "คูปองใหม่" : "Coupons to save"}</p><p className="mt-1 text-xs text-slate-500">{th ? "เก็บข้อเสนอไว้ใช้ใน Wallet" : "Save offers to your wallet"}</p></Link>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4"><h2 className="section-title">{th ? "สะสมต่อ" : "Continue collecting"}</h2>{programs.length > 0 && <Link href="/wallet" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link>}</div>
        <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
          {programs.length === 0 && <div className="cute-card p-6 text-center"><Sparkles className="mx-auto size-8 text-emerald-500" /><h3 className="mt-4 text-lg font-semibold">{th ? "เริ่ม Loyalty ใบแรกของคุณ" : "Start your first loyalty card"}</h3><p className="mt-2 text-sm text-zinc-500">{th ? "ค้นหาร้านหรือสแกน QR เพื่อเข้าร่วมโปรแกรม" : "Explore a store or scan a QR code to join a program."}</p><Link href="/explore" className="cute-primary mt-5 inline-flex rounded-xl px-4 py-3 text-sm font-bold">{th ? "ค้นหาร้าน" : "Explore"}</Link></div>}
          {programs.slice(0,4).map((program) => { const account = accountMap.get(program.id); const stamp = stampMap.get(program.id); const remaining = stamp?.required ? Math.max(0, stamp.required - stamp.stamp_count) : null; return <ProgramCard key={program.id} href={`/programs/${program.slug}`} locale={locale} name={program.name} subtitle={program.program_type === "stamps" ? (th ? "บัตรสแตมป์" : "Stamp card") : program.currency_name} programType={program.program_type} balance={program.program_type !== "stamps" ? Math.max(0,(account?.balance ?? 0)-(account?.reserved_balance ?? 0)) : undefined} stamps={program.program_type !== "points" && stamp?.required ? { current: stamp.stamp_count, required: stamp.required } : undefined} nextReward={remaining !== null && remaining > 0 && remaining <= 2 ? (th ? `อีก ${remaining} สแตมป์ ก็ใกล้ถึงรางวัลแล้ว` : `${remaining} more stamps to your reward`) : undefined}/>; })}
        </div>
      </section>

      <section className="mt-8 pb-2">
        <div className="flex items-center justify-between gap-4"><h2 className="section-title">{m.recent}</h2><Link href="/activity" className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link></div>
        {activity.length === 0 ? <div className="cute-card mt-3 p-5 text-sm text-zinc-500 shadow-none">{th ? "ยังไม่มีกิจกรรม พอรับแต้มครั้งแรก รายการจะมาอยู่ตรงนี้ ✨" : "No activity yet. Your first loyalty action will appear here ✨"}</div> : <div className="cute-card mt-3 divide-y divide-zinc-200/70 px-4 shadow-none dark:divide-white/10">{activity.map((row) => <div key={row.id} className="flex min-w-0 items-center gap-3 py-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-soft text-sm font-bold text-emerald-700 dark:text-emerald-200">{row.amount > 0 ? "+" : ""}{row.amount}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.name}</p><p className="truncate text-sm text-zinc-500">{row.note} · {row.unit}</p></div><ChevronRight className="size-4 shrink-0 text-zinc-400" /></div>)}</div>}
      </section>
    </main>
  );
}
