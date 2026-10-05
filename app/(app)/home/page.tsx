import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ChevronRight, Compass, Gift, Plus, QrCode, Sparkles, WalletCards } from "lucide-react";
import { Brand } from "@/components/brand";
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

  const [{ data: profile }, { data: memberships }, { data: accounts }, { data: stampRows }, { data: pointTx }, { data: stampTx }, unread] = await Promise.all([
    supabase.from("profiles").select("display_name,username,avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("program_members").select("program_id,status,programs(id,name,slug,program_type,currency_name)").eq("user_id", user.id).eq("status", "active").order("joined_at", { ascending: false }),
    supabase.from("point_accounts").select("program_id,balance,reserved_balance").eq("user_id", user.id),
    supabase.from("stamp_progress").select("program_id,stamp_count,status,stamp_cards(required_stamps)").eq("user_id", user.id).in("status", ["active","completed","reserved"]).order("round", { ascending: false }),
    supabase.from("point_transactions").select("id,program_id,amount,type,created_at,programs(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("stamp_transactions").select("id,program_id,amount,type,created_at,programs(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
  ]);

  const accountMap = new Map((accounts ?? []).map((x) => [x.program_id, x]));
  const stampMap = new Map<string, { stamp_count: number; required: number }>();
  for (const row of stampRows ?? []) {
    if (stampMap.has(row.program_id)) continue;
    const card = Array.isArray(row.stamp_cards) ? row.stamp_cards[0] : row.stamp_cards;
    stampMap.set(row.program_id, { stamp_count: row.stamp_count, required: card?.required_stamps ?? 0 });
  }

  const programs = (memberships ?? [])
    .map((membership) => Array.isArray(membership.programs) ? membership.programs[0] : membership.programs)
    .filter((program): program is NonNullable<typeof program> => Boolean(program));
  const totalAvailablePoints = programs.reduce((sum, program) => {
    if (program.program_type === "stamps") return sum;
    const account = accountMap.get(program.id);
    return sum + Math.max(0, Number(account?.balance ?? 0) - Number(account?.reserved_balance ?? 0));
  }, 0);

  const activity = [
    ...(pointTx ?? []).map((x) => ({ id: x.id, amount: x.amount, name: (Array.isArray(x.programs) ? x.programs[0] : x.programs)?.name ?? "PumpPoint", note: x.type, created_at: x.created_at, unit: th ? "แต้ม" : "pts" })),
    ...(stampTx ?? []).map((x) => ({ id: x.id, amount: x.amount, name: (Array.isArray(x.programs) ? x.programs[0] : x.programs)?.name ?? "PumpPoint", note: x.type, created_at: x.created_at, unit: th ? "สแตมป์" : "stamps" })),
  ].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,3);

  const firstName = profile?.display_name?.trim() || profile?.username || user.email?.split("@")[0] || (th ? "เพื่อน PumpPoint" : "PumpPoint friend");
  const quickActions = [
    [QrCode, th ? "สแกน" : "Scan", "/scan", "bg-mint-soft text-emerald-700 dark:text-emerald-200"],
    [WalletCards, th ? "วอลเล็ต" : "Wallet", "/wallet", "bg-lavender-soft text-violet-700 dark:text-violet-200"],
    [Gift, th ? "รางวัล" : "Rewards", "/rewards", "bg-reward-soft text-amber-700 dark:text-amber-200"],
    [Compass, th ? "ค้นหาร้าน" : "Explore", "/explore", "bg-lavender-soft text-blue-600 dark:text-blue-200"],
  ] as const;

  return (
    <main className="page-wrap min-w-0">
      <header className="flex items-center justify-between gap-3 lg:hidden">
        <Brand compact />
        <div className="flex items-center gap-2">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-soft text-sm font-bold text-emerald-800 dark:text-emerald-200">{firstName.slice(0,1).toUpperCase()}</div>
          <Link aria-label="Notifications" href="/notifications" className="cute-icon-button relative">
            <Bell className="size-5"/>
            {(unread.count ?? 0) > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-zinc-950 ring-2 ring-[var(--surface)]">{Math.min(99, unread.count ?? 0)}</span>}
          </Link>
        </div>
      </header>

      <section className="mt-7 overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#10C9A7_0%,#16BFC1_42%,#3B82F6_100%)] p-6 text-white shadow-[0_12px_32px_rgba(59,130,246,.16)] lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0"><p className="text-sm text-white/65">{m.greeting}</p><h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.035em]">{firstName} 👋</h1></div>
          <Sparkles className="size-6 shrink-0 text-[#FFF1A8]"/>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-2xl bg-white/14 p-5 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-[.12em] text-white/70">{th ? "แต้มของคุณ" : "Your points"}</p><p className="mt-1 truncate text-4xl font-bold tracking-[-0.055em] sm:text-5xl">{totalAvailablePoints.toLocaleString(th ? "th-TH" : "en-US")} <span className="text-sm font-semibold tracking-normal text-white/75">pts</span></p><div className="mt-4 flex items-center gap-2"><span className="rounded-full bg-white/18 px-2.5 py-1 text-xs font-bold">PumpPoint Member</span><span className="text-xs text-white/70">{programs.length} {th ? "โปรแกรม" : "programs"}</span></div></div>
          <div className="rounded-2xl bg-[#0F2D46]/85 p-5"><p className="text-xs text-white/60">{th ? "สะสมต่อได้เลย" : "Keep going"}</p><p className="mt-2 text-base font-semibold leading-6">{th ? "ทุกครั้งที่สแกน พาคุณเข้าใกล้รางวัลขึ้น" : "Every scan takes you closer to your next reward."}</p><Link href="/activity" className="mt-4 inline-flex items-center text-xs font-bold text-[#8FF2DF]">{th ? "ดูประวัติแต้ม →" : "Points history →"}</Link></div>
        </div>
        <Link href="/scan" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-[#0F2D46] transition hover:bg-slate-50 sm:max-w-xs"><QrCode className="size-5 text-[#10A98D]"/>{th ? "สแกนเพื่อรับแต้ม / สแตมป์" : "Scan to collect"}</Link>
      </section>

      <section className="mt-7">
        <h2 className="section-title">{th ? "ทางลัด" : "Quick actions"}</h2>
        <div className="mt-3 grid grid-cols-4 gap-2 lg:max-w-2xl">
          {quickActions.map(([Icon,label,href,tone]) => <Link key={href+label} href={href} className="cute-card flex min-w-0 flex-col items-center gap-2 p-3 text-center shadow-none"><span className={`grid size-10 place-items-center rounded-2xl ${tone}`}><Icon className="size-5"/></span><span className="max-w-full truncate text-[11px] font-bold">{label}</span></Link>)}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4"><h2 className="section-title">{th ? "การ์ดของฉัน" : "My cards"}</h2>{programs.length > 0 && <Link href="/wallet" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link>}</div>
        <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
          {programs.length === 0 && <div className="cute-card p-6 text-center"><div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-reward-soft text-amber-700 dark:text-amber-200"><Gift className="size-8"/></div><h3 className="mt-4 text-lg font-semibold">{th ? "วอลเล็ตยังว่างอยู่ 🌱" : "Your wallet is ready to grow 🌱"}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">{th ? "สแกน QR แรกเพื่อเข้าร่วมร้าน หรือสร้างโปรแกรมของคุณเองได้เลย" : "Scan your first QR to join a shop, or create your own loyalty program."}</p><div className="mt-5 grid gap-2 sm:grid-cols-2"><Link href="/scan" className="cute-primary flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><QrCode className="size-4"/>{th ? "สแกน QR" : "Scan QR"}</Link><Link href="/programs/new" className="cute-secondary flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><Plus className="size-4"/>{m.createProgram}</Link></div></div>}
          {programs.slice(0,4).map((program) => {
            const account = accountMap.get(program.id);
            const stamp = stampMap.get(program.id);
            const remaining = stamp?.required ? Math.max(0, stamp.required - stamp.stamp_count) : null;
            return <ProgramCard key={program.id} href={`/programs/${program.slug}`} locale={locale} name={program.name} subtitle={program.program_type === "stamps" ? (th ? "บัตรสแตมป์" : "Stamp card") : program.currency_name} programType={program.program_type} balance={program.program_type !== "stamps" ? Math.max(0,(account?.balance ?? 0)-(account?.reserved_balance ?? 0)) : undefined} stamps={program.program_type !== "points" && stamp?.required ? { current: stamp.stamp_count, required: stamp.required } : undefined} nextReward={remaining !== null && remaining > 0 && remaining <= 2 ? (th ? `อีก ${remaining} สแตมป์ ก็ใกล้ถึงรางวัลแล้ว` : `${remaining} more stamps to your reward`) : undefined}/>;
          })}
        </div>
      </section>

      <section className="mt-8 pb-2">
        <div className="flex items-center justify-between gap-4"><h2 className="section-title">{m.recent}</h2><Link href="/activity" className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link></div>
        {activity.length === 0 ? <div className="cute-card mt-3 p-5 text-sm text-zinc-500 shadow-none">{th ? "ยังไม่มีกิจกรรม พอรับแต้มครั้งแรก รายการจะมาอยู่ตรงนี้ ✨" : "No activity yet. Your first reward action will appear here ✨"}</div> :
        <div className="cute-card mt-3 divide-y divide-zinc-200/70 px-4 shadow-none dark:divide-white/10">
          {activity.map((row) => <div key={row.id} className="flex min-w-0 items-center gap-3 py-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-soft text-sm font-bold text-emerald-700 dark:text-emerald-200">{row.amount > 0 ? "+" : ""}{row.amount}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.name}</p><p className="truncate text-sm text-zinc-500">{row.note} · {row.unit}</p></div><ChevronRight className="size-4 shrink-0 text-zinc-400"/></div>)}
        </div>}
      </section>
    </main>
  );
}
