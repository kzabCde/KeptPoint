import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, Gift, History, Stamp } from "lucide-react";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const m = messages[locale].activity;
  const c = messages[locale].common;
  const { type = "all" } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const userId = auth.user.id;

  const [{data:points},{data:stamps},{data:redemptions}] = await Promise.all([
    supabase.from("point_transactions").select("id,amount,type,note,created_at,programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(50),
    supabase.from("stamp_transactions").select("id,amount,type,note,created_at,programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(50),
    supabase.from("reward_redemptions").select("id,status,created_at,rewards(name),programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(30),
  ]);

  const rows = [
    ...(points ?? []).map((x) => ({id:x.id,kind:"points",amount:`${x.amount>0?"+":""}${x.amount}`,name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:x.note||x.type,created_at:x.created_at,unit:c.points})),
    ...(stamps ?? []).map((x) => ({id:x.id,kind:"stamps",amount:`${x.amount>0?"+":""}${x.amount}`,name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:x.note||x.type,created_at:x.created_at,unit:c.stamps})),
    ...(redemptions ?? []).map((x) => ({id:x.id,kind:"redeem",amount:"",name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:`${(Array.isArray(x.rewards)?x.rewards[0]:x.rewards)?.name??(th?"รางวัล":"Reward")} · ${x.status}`,created_at:x.created_at,unit:""})),
  ].filter((x) => type === "all" || x.kind === type).sort((a,b) => Date.parse(b.created_at)-Date.parse(a.created_at));

  const filters = [["all",c.all],["points",m.earn],["stamps",m.stamp],["redeem",m.redeem]] as const;
  const iconFor = (kind: string) => kind === "points" ? Coins : kind === "stamps" ? Stamp : Gift;
  const toneFor = (kind: string) => kind === "points" ? "bg-mint-soft text-emerald-700 dark:text-emerald-200" : kind === "stamps" ? "bg-coral-soft text-rose-600 dark:text-rose-200" : "bg-reward-soft text-amber-700 dark:text-amber-200";

  return (
    <main className="min-w-0 px-5 py-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{th ? "ทุกการเคลื่อนไหว" : "Every reward moment"}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{m.title}</h1><p className="mt-2 text-sm text-zinc-500">{th ? "แต้ม สแตมป์ และการแลกรางวัล เรียงตามเวลาจริง" : "Points, stamps and redemptions in one timeline."}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-lavender-soft text-violet-700 dark:text-violet-200"><History className="size-6"/></span></div>
      <div className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{filters.map(([value,label]) => <Link key={value} href={`/activity?type=${value}`} className={type === value ? "soft-chip shrink-0 border-transparent bg-[#073f38] text-white dark:bg-emerald-300 dark:text-emerald-950" : "soft-chip shrink-0"}>{label}</Link>)}</div>
      {rows.length === 0 ? <div className="cute-card mt-4 p-7 text-center shadow-none"><History className="mx-auto size-8 text-zinc-400"/><p className="mt-3 font-semibold">{th ? "ยังไม่มีกิจกรรม" : "No activity yet"}</p><p className="mt-1 text-sm text-zinc-500">{th ? "รับแต้ม สแตมป์ หรือแลกรางวัลครั้งแรกแล้วจะมาอยู่ตรงนี้ ✨" : "Your first point, stamp or reward action will appear here ✨"}</p></div> : <div className="cute-card mt-4 divide-y divide-zinc-200/70 px-4 shadow-none dark:divide-white/10">{rows.map((row) => { const Icon = iconFor(row.kind); return <div key={`${row.kind}-${row.id}`} className="flex min-w-0 items-center gap-3 py-4"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${toneFor(row.kind)}`}><Icon className="size-5"/></span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.name}</p><p className="mt-1 break-words text-xs leading-5 text-zinc-500">{row.note} · {new Intl.DateTimeFormat(th?"th-TH":"en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(row.created_at))}</p></div>{row.amount && <p className="shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-300">{row.amount} {row.unit}</p>}</div>;})}</div>}
    </main>
  );
}
