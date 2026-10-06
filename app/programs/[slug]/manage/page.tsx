import Link from "next/link";
import { BadgePercent, BarChart3, Coins, Gift, QrCode, Share2, Sparkles, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export default async function ManageProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const th = locale === "th";
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name,program_type,currency_name").eq("slug", slug).single();
  if (!program) return <main className="p-6">{th ? "ไม่พบโปรแกรม" : "Program not found."}</main>;

  const [members, rewards, pendingRewards, issued, recent, referrals, rewardedReferrals, couponClaims, couponRedeemed, tiersResult, accountsResult] = await Promise.all([
    supabase.from("program_members").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "active"),
    supabase.from("rewards").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("active", true),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id).in("status", ["pending","reserved"]),
    supabase.from("point_transactions").select("total:amount.sum()").eq("program_id", program.id).gt("amount", 0),
    supabase.from("point_transactions").select("id,amount,type,created_at,profiles:user_id(display_name,username)").eq("program_id", program.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("program_id", program.id),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "rewarded"),
    supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id),
    supabase.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "redeemed"),
    supabase.from("program_tiers").select("name,min_lifetime_earned").eq("program_id", program.id).eq("active", true).order("min_lifetime_earned"),
    supabase.from("point_accounts").select("lifetime_earned").eq("program_id", program.id),
  ]);

  const totalIssued = Number(issued.data?.[0]?.total ?? 0);
  const tiers = tiersResult.data ?? [];
  const tierDistribution = new Map<string, number>();
  for (const account of accountsResult.data ?? []) {
    const lifetime = Number(account.lifetime_earned ?? 0);
    let label = "Member";
    for (const tier of tiers) if (lifetime >= Number(tier.min_lifetime_earned)) label = tier.name;
    tierDistribution.set(label, (tierDistribution.get(label) ?? 0) + 1);
  }
  const quick = [
    [UsersRound, th ? "ให้แต้ม / สแตมป์" : "Give points / stamps", `/programs/${slug}/manage/members`],
    [QrCode, th ? "สร้าง QR" : "Create QR", `/programs/${slug}/manage/qr`],
    [BadgePercent, th ? "สร้างคูปอง" : "Create coupon", `/programs/${slug}/manage/growth?tab=coupons`],
    [Gift, th ? "เพิ่มรางวัล" : "Add reward", `/programs/${slug}/manage/rewards`],
  ] as const;

  return <main className="p-5 sm:p-7 lg:p-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]">{th ? "ศูนย์ควบคุม Loyalty" : "Loyalty control center"}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{program.name}</h1><p className="mt-2 text-sm text-slate-500">{th ? "ดูภาพรวม แล้วไปทำงานที่ใช้บ่อยได้ทันที" : "See what is happening, then jump into the work that matters."}</p></div><Link href={`/programs/${slug}/manage/analytics`} className="cute-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold"><BarChart3 className="size-4" />{th ? "ดู Insights" : "View insights"}</Link></div>

      <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={UsersRound} value={members.count ?? 0} label={th ? "สมาชิกที่ใช้งาน" : "Active members"} />
        <Kpi icon={Coins} value={totalIssued.toLocaleString(th ? "th-TH" : "en-US")} label={th ? `แจก ${program.currency_name} แล้ว` : `${program.currency_name} issued`} />
        <Kpi icon={Gift} value={rewards.count ?? 0} label={th ? "รางวัลที่เปิดใช้" : "Active rewards"} />
        <Kpi icon={Sparkles} value={pendingRewards.count ?? 0} label={th ? "รางวัลรอยืนยัน" : "Pending rewards"} />
      </section>

      <section className="mt-7"><h2 className="text-sm font-semibold text-[#0F2D46] dark:text-white">{th ? "ทำงานด่วน" : "Quick actions"}</h2><div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">{quick.map(([Icon,label,href]) => <Link key={href} href={href} className="flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold transition hover:border-[#10C9A7]/50"><Icon className="size-4 text-[#087F6E]" />{label}</Link>)}</div></section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Growth</p><h2 className="mt-1 text-lg font-semibold">{th ? "Referral และ Coupons" : "Referral & coupons"}</h2></div><Link href={`/programs/${slug}/manage/growth`} className="text-xs font-bold text-[#087F6E]">{th ? "จัดการ →" : "Manage →"}</Link></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#E6FAF6] p-4 text-[#0F2D46]"><Share2 className="size-5 text-[#087F6E]"/><p className="mt-4 text-2xl font-semibold">{referrals.count ?? 0}</p><p className="text-xs text-slate-500">{th ? "คำเชิญ" : "Invites"}</p><p className="mt-1 text-[10px] font-bold text-[#087F6E]">{rewardedReferrals.count ?? 0} {th ? "สำเร็จ" : "converted"}</p></div><div className="rounded-2xl bg-[#FFF9E8] p-4 text-[#0F2D46]"><BadgePercent className="size-5 text-[#B7791F]"/><p className="mt-4 text-2xl font-semibold">{couponClaims.count ?? 0}</p><p className="text-xs text-slate-500">{th ? "คูปองที่ถูกเก็บ" : "Coupon claims"}</p><p className="mt-1 text-[10px] font-bold text-[#B7791F]">{couponRedeemed.count ?? 0} {th ? "ใช้แล้ว" : "redeemed"}</p></div></div></div>

        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Tiers</p><h2 className="mt-1 text-lg font-semibold">{th ? "การกระจายระดับสมาชิก" : "Member tier mix"}</h2></div><Link href={`/programs/${slug}/manage/growth?tab=tiers`} className="text-xs font-bold text-[#087F6E]">{th ? "ตั้งค่า →" : "Configure →"}</Link></div><div className="mt-5 grid gap-3">{tierDistribution.size === 0 ? <p className="text-sm text-slate-500">{th ? "ยังไม่มีข้อมูลระดับสมาชิก" : "No tier data yet."}</p> : [...tierDistribution.entries()].map(([name,count]) => { const total = Math.max(1, accountsResult.data?.length ?? 0); return <div key={name}><div className="flex items-center justify-between text-xs"><span className="font-semibold">{name}</span><span className="text-slate-400">{count}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{width:`${(count/total)*100}%`}}/></div></div>; })}</div></div>
      </section>

      <section className="mt-8"><h2 className="text-sm font-semibold">{th ? "กิจกรรมล่าสุด" : "Recent activity"}</h2>{(recent.data ?? []).length === 0 ? <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-zinc-500">{th ? "ยังไม่มีการออกแต้ม" : "No point activity yet."}</div> : <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">{(recent.data ?? []).map((row) => { const user = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles; return <div key={row.id} className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-0"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#E6FAF6] text-xs font-bold text-[#087F6E]">+{row.amount}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user?.display_name || user?.username || (th ? "สมาชิก" : "Member")}</p><p className="text-xs text-slate-400">{row.type} · {new Intl.DateTimeFormat(th ? "th-TH" : "en-US", {dateStyle:"medium"}).format(new Date(row.created_at))}</p></div></div>; })}</div>}</section>
    </div>
  </main>;
}

function Kpi({ icon: Icon, value, label }: { icon: typeof UsersRound; value: string | number; label: string }) {
  return <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-4"><Icon className="size-5 text-[#087F6E]"/><p className="mt-4 truncate text-2xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}
