import Link from "next/link";
import { redirect } from "next/navigation";
import { Gift, Search, Sparkles } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Wallet" };

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const locale = await getLocale();
  const m = messages[locale].wallet;
  const c = messages[locale].common;
  const th = locale === "th";
  const { q = "", type = "all" } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const userId = auth.user.id;

  const [{ data: memberships }, { data: accounts }, { data: stampRows }] = await Promise.all([
    supabase.from("program_members").select("program_id,status,programs(id,name,slug,program_type,currency_name)").eq("user_id", userId).eq("status","active").order("joined_at",{ascending:false}),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance").eq("user_id", userId),
    supabase.from("stamp_progress").select("program_id,stamp_count,status,stamp_cards(required_stamps)").eq("user_id",userId).in("status",["active","completed","reserved"]).order("round",{ascending:false}),
  ]);

  const accountMap = new Map((accounts ?? []).map((x) => [x.program_id, x]));
  const stampMap = new Map<string,{current:number;required:number}>();
  for (const row of stampRows ?? []) {
    if (stampMap.has(row.program_id)) continue;
    const card = Array.isArray(row.stamp_cards) ? row.stamp_cards[0] : row.stamp_cards;
    if (card) stampMap.set(row.program_id, { current: row.stamp_count, required: card.required_stamps });
  }

  const normalized = q.trim().toLowerCase();
  const rows = (memberships ?? [])
    .map((x) => Array.isArray(x.programs) ? x.programs[0] : x.programs)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .filter((p) => {
      const matchesText = !normalized || p.name.toLowerCase().includes(normalized);
      const matchesType = type === "all" || type === p.program_type;
      return matchesText && matchesType;
    });

  const filters = [["all", c.all], ["points", m.points], ["stamps", m.stamps], ["hybrid", th ? "ไฮบริด" : "Hybrid"]] as const;

  return (
    <main className="min-w-0 px-5 py-6">
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-200"><Sparkles className="size-4"/>{th ? "การ์ดสะสมของคุณ" : "Your loyalty collection"}</div><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{th ? "เก็บแต้ม สแตมป์ และรางวัลจากทุกโปรแกรมไว้ในที่เดียว" : "Keep points, stamps and rewards from every program in one place."}</p></div>
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-reward-soft text-amber-700 dark:text-amber-200"><Gift className="size-6"/></span>
      </div>

      <form className="mt-6 flex min-w-0 gap-2">
        <label className="cute-input flex h-12 min-w-0 flex-1 items-center gap-3 px-4"><Search className="size-4 shrink-0 text-zinc-400"/><input name="q" defaultValue={q} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={m.search}/></label>
        <input type="hidden" name="type" value={type}/>
        <button className="cute-primary shrink-0 rounded-2xl px-4 text-sm font-semibold">{th ? "ค้นหา" : "Search"}</button>
      </form>

      <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map(([value,label]) => <Link key={value} href={`/wallet?type=${value}&q=${encodeURIComponent(q)}`} className={type === value ? "soft-chip shrink-0 border-transparent bg-[#073f38] text-white dark:bg-emerald-300 dark:text-emerald-950" : "soft-chip shrink-0"}>{label}</Link>)}
      </div>

      <div className="mt-5 grid min-w-0 gap-3">
        {rows.length === 0 && <div className="cute-card p-7 text-center"><div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-mint-soft text-emerald-700 dark:text-emerald-200"><Gift className="size-8"/></div><h2 className="mt-4 text-lg font-semibold">{normalized || type !== "all" ? (th ? "ยังไม่พบการ์ดที่ตรงกัน" : "No matching cards") : (th ? "ยังไม่มีการ์ดในวอลเล็ต" : "Your wallet is empty")}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{normalized || type !== "all" ? (th ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะ" : "Try another search or filter.") : (th ? "สแกน QR ของร้านแรก แล้วการ์ดจะมาอยู่ตรงนี้" : "Scan your first shop QR and its loyalty card will appear here.")}</p>{!normalized && type === "all" && <Link href="/scan" className="cute-primary mt-5 flex min-h-12 items-center justify-center rounded-2xl font-semibold">{th ? "สแกน QR แรก" : "Scan first QR"}</Link>}</div>}
        {rows.map((p) => {
          const a = accountMap.get(p.id);
          const s = stampMap.get(p.id);
          const remaining = s ? Math.max(0, s.required - s.current) : null;
          return <ProgramCard key={p.id} href={`/programs/${p.slug}`} locale={locale} name={p.name} subtitle={p.program_type === "stamps" ? m.stampCard : p.currency_name} programType={p.program_type} balance={p.program_type !== "stamps" ? Math.max(0,(a?.balance ?? 0)-(a?.reserved_balance ?? 0)) : undefined} stamps={p.program_type !== "points" && s ? s : undefined} nextReward={remaining !== null && remaining <= 2 && remaining > 0 ? (th ? `อีก ${remaining} สแตมป์ก็ใกล้ถึงรางวัล` : `${remaining} more stamps to a reward`) : undefined}/>;
        })}
      </div>
    </main>
  );
}
