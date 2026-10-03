import Link from "next/link";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const locale=await getLocale();
  const m=messages[locale].activity;
  const c=messages[locale].common;
  const { type="all" }=await searchParams;
  const supabase=await createClient();
  const { data:auth }=await supabase.auth.getUser();
  const userId=auth.user!.id;
  const [{data:points},{data:stamps},{data:redemptions}]=await Promise.all([
    supabase.from("point_transactions").select("id,amount,type,note,created_at,programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(50),
    supabase.from("stamp_transactions").select("id,amount,type,note,created_at,programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(50),
    supabase.from("reward_redemptions").select("id,status,created_at,rewards(name),programs(name)").eq("user_id",userId).order("created_at",{ascending:false}).limit(30),
  ]);
  const rows=[
    ...(points??[]).map(x=>({id:x.id,kind:"points",amount:`${x.amount>0?"+":""}${x.amount}`,name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:x.note||x.type,created_at:x.created_at,unit:c.points})),
    ...(stamps??[]).map(x=>({id:x.id,kind:"stamps",amount:`${x.amount>0?"+":""}${x.amount}`,name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:x.note||x.type,created_at:x.created_at,unit:c.stamps})),
    ...(redemptions??[]).map(x=>({id:x.id,kind:"redeem",amount:"",name:(Array.isArray(x.programs)?x.programs[0]:x.programs)?.name??"KeptPoint",note:`${(Array.isArray(x.rewards)?x.rewards[0]:x.rewards)?.name??(locale==="th"?"รางวัล":"Reward")} · ${x.status}`,created_at:x.created_at,unit:""})),
  ].filter(x=>type==="all"||x.kind===type).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
  const filters=[["all",c.all],["points",m.earn],["stamps",m.stamp],["redeem",m.redeem]] as const;
  return <main className="min-w-0 px-5 py-6"><h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1><div className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-1 text-sm">{filters.map(([value,label])=><Link key={value} href={`/activity?type=${value}`} className={`shrink-0 rounded-full px-4 py-2 ${type===value?"bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{label}</Link>)}</div>{rows.length===0?<p className="mt-5 rounded-[24px] border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">{locale==="th"?"ยังไม่มีกิจกรรม":"No activity yet."}</p>:<div className="mt-5 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{rows.map(row=><div key={`${row.kind}-${row.id}`} className="flex min-w-0 gap-3 py-4"><div className="min-w-0 flex-1"><p className="truncate font-medium">{row.name}</p><p className="mt-1 break-words text-sm text-zinc-500">{row.note} · {new Intl.DateTimeFormat(locale==="th"?"th-TH":"en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(row.created_at))}</p></div>{row.amount&&<p className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-300">{row.amount} {row.unit}</p>}</div>)}</div>}</main>;
}
