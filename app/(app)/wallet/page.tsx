import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgePercent, Crown, Gift, Search, Sparkles } from "lucide-react";
import { ProgramCard } from "@/components/program-card";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Wallet" };

type Filter = "all" | "points" | "stamps" | "coupons" | "rewards";

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const locale = await getLocale();
  const m = messages[locale].wallet;
  const c = messages[locale].common;
  const th = locale === "th";
  const { q = "", type = "all" } = await searchParams;
  const filter: Filter = (["all","points","stamps","coupons","rewards"] as const).includes(type as Filter) ? type as Filter : "all";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const userId = auth.user.id;

  const [{ data: memberships }, { data: accounts }, { data: stampRows }] = await Promise.all([
    supabase.from("program_members").select("program_id,status,programs(id,name,slug,program_type,currency_name)").eq("user_id", userId).eq("status","active").order("joined_at",{ascending:false}),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance,lifetime_earned").eq("user_id", userId),
    supabase.from("stamp_progress").select("program_id,stamp_count,status,stamp_cards(required_stamps)").eq("user_id",userId).in("status",["active","completed","reserved"]).order("round",{ascending:false}),
  ]);

  const programs = (memberships ?? []).map((row) => Array.isArray(row.programs) ? row.programs[0] : row.programs).filter((program): program is NonNullable<typeof program> => Boolean(program));
  const programIds = programs.map((program) => program.id);
  const empty = { data: [] as never[] };
  const [couponClaimsResult, rewardsResult, tiersResult] = programIds.length ? await Promise.all([
    supabase.from("coupon_redemptions").select("program_id,status").eq("user_id", userId).in("program_id", programIds).in("status", ["claimed","redeemed"]),
    supabase.from("rewards").select("id,program_id").in("program_id", programIds).eq("active", true),
    supabase.from("program_tiers").select("program_id,name,min_lifetime_earned").in("program_id", programIds).eq("active", true).order("min_lifetime_earned"),
  ]) : [empty, empty, empty];

  const accountMap = new Map((accounts ?? []).map((row) => [row.program_id, row]));
  const stampMap = new Map<string,{current:number;required:number}>();
  for (const row of stampRows ?? []) {
    if (stampMap.has(row.program_id)) continue;
    const card = Array.isArray(row.stamp_cards) ? row.stamp_cards[0] : row.stamp_cards;
    if (card) stampMap.set(row.program_id, { current: row.stamp_count, required: card.required_stamps });
  }
  const couponCount = new Map<string, number>();
  for (const row of couponClaimsResult.data ?? []) couponCount.set(row.program_id, (couponCount.get(row.program_id) ?? 0) + 1);
  const rewardCount = new Map<string, number>();
  for (const row of rewardsResult.data ?? []) rewardCount.set(row.program_id, (rewardCount.get(row.program_id) ?? 0) + 1);
  const tiersByProgram = new Map<string, typeof tiersResult.data>();
  for (const tier of tiersResult.data ?? []) { const rows = tiersByProgram.get(tier.program_id) ?? []; rows.push(tier); tiersByProgram.set(tier.program_id, rows); }

  const normalized = q.trim().toLowerCase();
  const rows = programs.filter((program) => {
    const matchesText = !normalized || program.name.toLowerCase().includes(normalized);
    if (!matchesText) return false;
    if (filter === "all") return true;
    if (filter === "points") return program.program_type === "points" || program.program_type === "hybrid";
    if (filter === "stamps") return program.program_type === "stamps" || program.program_type === "hybrid";
    if (filter === "coupons") return (couponCount.get(program.id) ?? 0) > 0;
    return (rewardCount.get(program.id) ?? 0) > 0;
  });

  const filters: [Filter,string][] = [
    ["all", c.all],
    ["points", m.points],
    ["stamps", m.stamps],
    ["coupons", th ? "คูปอง" : "Coupons"],
    ["rewards", th ? "รางวัล" : "Rewards"],
  ];

  return (
    <main className="page-wrap min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div><div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-200"><Sparkles className="size-4"/>{th ? "ทุก Loyalty ในที่เดียว" : "Every loyalty card in one place"}</div><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{th ? "ดูแต้ม สแตมป์ ระดับสมาชิก คูปองที่เก็บไว้ และรางวัลของแต่ละร้าน" : "See points, stamps, tiers, saved coupons, and rewards for every program."}</p></div>
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-reward-soft text-amber-700 dark:text-amber-200"><Gift className="size-6"/></span>
      </div>

      <form className="mt-6 flex min-w-0 gap-2">
        <label className="cute-input flex h-12 min-w-0 flex-1 items-center gap-3 px-4"><Search className="size-4 shrink-0 text-zinc-400"/><input name="q" defaultValue={q} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={m.search}/></label>
        <input type="hidden" name="type" value={filter}/>
        <button className="cute-primary shrink-0 rounded-2xl px-4 text-sm font-semibold">{th ? "ค้นหา" : "Search"}</button>
      </form>

      <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map(([value,label]) => <Link key={value} href={`/wallet?type=${value}&q=${encodeURIComponent(q)}`} className={filter === value ? "soft-chip shrink-0 border-transparent bg-[#0F2D46] text-white dark:bg-emerald-300 dark:text-emerald-950" : "soft-chip shrink-0"}>{label}</Link>)}
      </div>

      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
        {rows.length === 0 && <div className="cute-card p-7 text-center md:col-span-2"><div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-mint-soft text-emerald-700 dark:text-emerald-200"><Gift className="size-8"/></div><h2 className="mt-4 text-lg font-semibold">{normalized || filter !== "all" ? (th ? "ยังไม่พบการ์ดที่ตรงกัน" : "No matching cards") : (th ? "ยังไม่มีการ์ดในวอลเล็ต" : "Your wallet is empty")}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{normalized || filter !== "all" ? (th ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะ" : "Try another search or filter.") : (th ? "สแกน QR ของร้านแรก แล้วการ์ดจะมาอยู่ตรงนี้" : "Scan your first shop QR and its loyalty card will appear here.")}</p>{!normalized && filter === "all" && <Link href="/scan" className="cute-primary mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl px-5 font-semibold">{th ? "สแกน QR แรก" : "Scan first QR"}</Link>}</div>}
        {rows.map((program) => {
          const account = accountMap.get(program.id);
          const stamp = stampMap.get(program.id);
          const remaining = stamp ? Math.max(0, stamp.required - stamp.current) : null;
          const lifetime = Number(account?.lifetime_earned ?? 0);
          const tierRows = tiersByProgram.get(program.id) ?? [];
          const tier = [...tierRows].reverse().find((item) => lifetime >= Number(item.min_lifetime_earned));
          const coupons = couponCount.get(program.id) ?? 0;
          const rewards = rewardCount.get(program.id) ?? 0;
          return <article key={program.id} className="min-w-0 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
            <ProgramCard href={`/programs/${program.slug}`} locale={locale} name={program.name} subtitle={program.program_type === "stamps" ? m.stampCard : program.currency_name} programType={program.program_type} balance={program.program_type !== "stamps" ? Math.max(0,(account?.balance ?? 0)-(account?.reserved_balance ?? 0)) : undefined} stamps={program.program_type !== "points" && stamp ? stamp : undefined} nextReward={remaining !== null && remaining <= 2 && remaining > 0 ? (th ? `อีก ${remaining} สแตมป์ก็ใกล้ถึงรางวัล` : `${remaining} more stamps to a reward`) : undefined}/>
            <div className="flex flex-wrap gap-2 px-2 pb-2 pt-3">
              {tier && <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[10px] font-bold text-blue-600"><Crown className="size-3" />{tier.name}</span>}
              {coupons > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[10px] font-bold text-[#8B6415]"><BadgePercent className="size-3" />{coupons} {th ? "คูปอง" : "coupons"}</span>}
              {rewards > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[#E6FAF6] px-2.5 py-1 text-[10px] font-bold text-[#087F6E]"><Gift className="size-3" />{rewards} {th ? "รางวัล" : "rewards"}</span>}
            </div>
          </article>;
        })}
      </div>
    </main>
  );
}
