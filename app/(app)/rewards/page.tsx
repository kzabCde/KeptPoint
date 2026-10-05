import { randomUUID } from "node:crypto";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Gift, LockKeyhole, Search, Sparkles, Store } from "lucide-react";
import { redeemReward } from "@/app/actions/loyalty";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getRewardState, rewardProgress } from "@/lib/reward-state";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Rewards" };

export default async function RewardsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: memberships } = await supabase.from("program_members").select("program_id").eq("user_id", auth.user.id).eq("status", "active");
  const programIds = (memberships ?? []).map((row) => row.program_id);
  const empty = { data: [] as never[] };
  const [rewardsResult, accountsResult, stampsResult] = programIds.length ? await Promise.all([
    supabase.from("rewards").select("id,program_id,name,description,reward_type,points_required,stamps_required,stock,expires_at,programs(name,slug)").in("program_id", programIds).eq("active", true).order("created_at", { ascending: false }),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance").eq("user_id", auth.user.id).in("program_id", programIds),
    supabase.from("stamp_progress").select("program_id,stamp_count,status").eq("user_id", auth.user.id).in("program_id", programIds).in("status", ["active", "completed", "reserved"]).order("round", { ascending: false }),
  ]) : [empty, empty, empty];

  const balances = new Map((accountsResult.data ?? []).map((row) => [row.program_id, Math.max(0, Number(row.balance ?? 0) - Number(row.reserved_balance ?? 0))]));
  const stamps = new Map<string, number>();
  for (const row of stampsResult.data ?? []) if (!stamps.has(row.program_id)) stamps.set(row.program_id, Number(row.stamp_count ?? 0));
  const normalized = q.trim().toLowerCase();
  const rewards = (rewardsResult.data ?? []).filter((reward) => {
    const program = Array.isArray(reward.programs) ? reward.programs[0] : reward.programs;
    return !normalized || reward.name.toLowerCase().includes(normalized) || program?.name?.toLowerCase().includes(normalized);
  });

  return <main className="page-wrap min-w-0">
    <div className="flex items-start justify-between gap-5">
      <div><p className="text-sm font-semibold text-[#087F6E]"><Sparkles className="mr-1.5 inline size-4" />{th ? "แลกความคุ้มค่าของคุณ" : "Make your points count"}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-[#10243A] dark:text-white">{th ? "รางวัล" : "Rewards"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{th ? "ดูรางวัลจากโปรแกรมที่คุณเข้าร่วม และรู้ทันทีว่าอะไรพร้อมแลกแล้ว" : "Browse rewards from your programs and see what you can redeem right now."}</p></div>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF6D8] text-amber-600"><Gift className="size-6" /></span>
    </div>

    <form className="mt-6 max-w-xl"><label className="cute-input flex h-12 items-center gap-3 px-4"><Search className="size-4 text-slate-400" /><input name="q" defaultValue={q} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={th ? "ค้นหารางวัลหรือร้าน" : "Search rewards or stores"} /><button className="text-sm font-bold text-[#087F6E]">{th ? "ค้นหา" : "Search"}</button></label></form>

    {rewards.length === 0 ? <section className="cute-card mt-6 p-8 text-center shadow-none"><Gift className="mx-auto size-9 text-slate-300" /><h2 className="mt-4 font-semibold">{normalized ? (th ? "ไม่พบรางวัลที่ค้นหา" : "No matching rewards") : (th ? "ยังไม่มีรางวัล" : "No rewards yet")}</h2><p className="mt-2 text-sm text-slate-500">{th ? "เข้าร่วมร้านเพิ่มเพื่อพบรางวัลใหม่ ๆ" : "Explore more stores to discover new rewards."}</p><Link href="/explore" className="cute-primary mt-5 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-bold">{th ? "ค้นหาร้าน" : "Explore stores"}</Link></section> :
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rewards.map((reward) => {
        const program = Array.isArray(reward.programs) ? reward.programs[0] : reward.programs;
        const balance = balances.get(reward.program_id) ?? 0;
        const stampCount = stamps.get(reward.program_id) ?? 0;
        const state = getRewardState({ rewardType: reward.reward_type, pointsRequired: reward.points_required, stampsRequired: reward.stamps_required, stock: reward.stock, balance, stamps: stampCount });
        const current = reward.reward_type === "stamps" ? stampCount : balance;
        const required = reward.reward_type === "stamps" ? reward.stamps_required : reward.points_required;
        const progress = rewardProgress(current, required);
        const cost = reward.reward_type === "points" ? `${reward.points_required ?? 0} ${th ? "แต้ม" : "pts"}` : reward.reward_type === "stamps" ? `${reward.stamps_required ?? 0} ${th ? "สแตมป์" : "stamps"}` : (th ? "รับสิทธิ์ที่ร้าน" : "In-store reward");
        const missing = required ? Math.max(0, Number(required) - current) : 0;
        const redeem = redeemReward.bind(null, reward.id);
        const idempotencyKey = randomUUID();
        return <article key={reward.id} className="cute-card flex min-w-0 flex-col overflow-hidden p-5 shadow-none">
          <div className="flex items-start gap-3"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${state === "available" ? "bg-[#10C9A7] text-[#0F2D46]" : "bg-slate-100 text-slate-500 dark:bg-white/5"}`}>{state === "locked" ? <LockKeyhole className="size-5" /> : <Gift className="size-5" />}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-500"><Store className="mr-1 inline size-3.5" />{program?.name ?? "PumpPoint"}</p><h2 className="mt-1 break-words text-lg font-semibold tracking-tight">{reward.name}</h2></div></div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{reward.description || cost}</p>
          <div className="mt-4 flex items-center justify-between gap-3"><span className="text-lg font-bold text-[#0F2D46] dark:text-white">{cost}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${state === "available" ? "bg-[#E6FAF6] text-[#087F6E]" : "bg-slate-100 text-slate-500 dark:bg-white/5"}`}>{state === "available" ? (th ? "พร้อมแลก" : "Ready") : state === "almost" ? (th ? "ใกล้แล้ว" : "Almost") : (th ? "ยังไม่ถึง" : "Locked")}</span></div>
          {required && required > 0 && <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-[#10C9A7]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{state === "available" ? (th ? "คุณมีพอสำหรับรางวัลนี้" : "You have enough for this reward") : (th ? `อีก ${missing} ก็พร้อมแลก` : `${missing} more to unlock`)}</p></div>}
          <div className="mt-auto grid grid-cols-2 gap-2 pt-5"><Link href={program?.slug ? `/programs/${program.slug}` : "/wallet"} className="cute-secondary flex min-h-11 items-center justify-center rounded-xl px-3 text-sm font-semibold">{th ? "รายละเอียด" : "Details"}</Link><form action={redeem}><input type="hidden" name="idempotencyKey" value={idempotencyKey}/><PendingSubmitButton pendingLabel={th ? "กำลังแลก…" : "Redeeming…"} disabled={state !== "available" || reward.stock === 0} className="cute-primary min-h-11 w-full rounded-xl px-3 text-sm font-bold disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none">{th ? "แลกรางวัล" : "Redeem"}</PendingSubmitButton></form></div>
        </article>;
      })}
    </section>}
  </main>;
}
