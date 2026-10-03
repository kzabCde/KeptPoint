import Link from "next/link";
import { Search } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Wallet" };

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const locale = await getLocale();
  const m = messages[locale].wallet;
  const c = messages[locale].common;
  const { q = "", type = "all" } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user!.id;

  const [{ data: memberships }, { data: accounts }, { data: stampRows }] = await Promise.all([
    supabase.from("program_members").select("program_id,status,programs(id,name,slug,program_type,currency_name)").eq("user_id", userId).eq("status","active").order("joined_at",{ascending:false}),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance").eq("user_id", userId),
    supabase.from("stamp_progress").select("program_id,stamp_count,status,stamp_cards(required_stamps)").eq("user_id",userId).in("status",["active","completed","reserved"]).order("round",{ascending:false}),
  ]);

  const accountMap=new Map((accounts??[]).map(x=>[x.program_id,x]));
  const stampMap=new Map<string,{current:number;required:number}>();
  for(const row of stampRows??[]){ if(stampMap.has(row.program_id)) continue; const card=Array.isArray(row.stamp_cards)?row.stamp_cards[0]:row.stamp_cards; if(card) stampMap.set(row.program_id,{current:row.stamp_count,required:card.required_stamps}); }

  const normalized=q.trim().toLowerCase();
  const rows=(memberships??[]).map(x=>Array.isArray(x.programs)?x.programs[0]:x.programs).filter((p):p is NonNullable<typeof p>=>Boolean(p)).filter(p=>{
    const matchesText=!normalized||p.name.toLowerCase().includes(normalized);
    const matchesType=type==="all"||type===p.program_type||(type==="stamps"&&p.program_type==="hybrid")||(type==="points"&&p.program_type==="hybrid");
    return matchesText&&matchesType;
  });

  const filters=[["all",c.all],["points",m.points],["stamps",m.stamps]] as const;
  return <main className="min-w-0 px-5 py-6">
    <h1 className="text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1>
    <form className="mt-5 flex min-w-0 gap-2">
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"><Search className="size-4 shrink-0 text-zinc-400"/><input name="q" defaultValue={q} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={m.search}/></label>
      <button className="rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{locale==="th"?"ค้นหา":"Search"}</button>
    </form>
    <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1 text-sm">{filters.map(([value,label])=><Link key={value} href={`/wallet?type=${value}&q=${encodeURIComponent(q)}`} className={`shrink-0 rounded-full px-4 py-2 ${type===value?"bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950":"border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{label}</Link>)}</div>
    <div className="mt-5 grid min-w-0 gap-3">
      {rows.length===0&&<p className="rounded-[24px] border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">{locale==="th"?"ไม่พบโปรแกรมในวอลเล็ต":"No wallet programs found."}</p>}
      {rows.map(p=>{const a=accountMap.get(p.id);const s=stampMap.get(p.id);return <ProgramCard key={p.id} href={`/programs/${p.slug}`} locale={locale} name={p.name} subtitle={p.program_type==="stamps"?m.stampCard:p.currency_name} balance={p.program_type!=="stamps"?Math.max(0,(a?.balance??0)-(a?.reserved_balance??0)):undefined} stamps={p.program_type!=="points"&&s?s:undefined}/>})}
    </div>
  </main>;
}
