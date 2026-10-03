import Link from "next/link";
import { Bell, ChevronRight, Plus } from "lucide-react";
import { Brand } from "@/components/brand";
import { ProgramCard } from "@/components/program-card";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const locale = await getLocale();
  const m = messages[locale].home;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user!;

  const [{ data: profile }, { data: memberships }, { data: accounts }, { data: stampRows }, { data: pointTx }, { data: stampTx }, unread] = await Promise.all([
    supabase.from("profiles").select("display_name,username").eq("id", user.id).maybeSingle(),
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

  const activity = [
    ...(pointTx ?? []).map((x) => ({ id: x.id, amount: x.amount, name: (Array.isArray(x.programs) ? x.programs[0] : x.programs)?.name ?? "KeptPoint", note: x.type, created_at: x.created_at, unit: locale === "th" ? "แต้ม" : "pts" })),
    ...(stampTx ?? []).map((x) => ({ id: x.id, amount: x.amount, name: (Array.isArray(x.programs) ? x.programs[0] : x.programs)?.name ?? "KeptPoint", note: x.type, created_at: x.created_at, unit: locale === "th" ? "สแตมป์" : "stamps" })),
  ].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,3);

  const firstName = profile?.display_name?.trim() || profile?.username || user.email?.split("@")[0] || (locale === "th" ? "ผู้ใช้ KeptPoint" : "KeptPoint user");

  return (
    <main className="min-w-0 px-5 py-6">
      <header>
        <div className="flex items-center justify-between gap-3">
          <Brand compact />
          <Link aria-label="Notifications" href="/notifications" className="relative grid size-11 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <Bell className="size-5"/>
            {(unread.count ?? 0) > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-zinc-950">{Math.min(99, unread.count ?? 0)}</span>}
          </Link>
        </div>
        <div className="mt-7 min-w-0"><p className="text-sm text-zinc-500">{m.greeting}</p><h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">{firstName}</h1></div>
      </header>

      <section className="mt-7 grid min-w-0 gap-3">
        {(memberships ?? []).length === 0 && <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white/60 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950/50"><p className="font-semibold">{locale === "th" ? "ยังไม่มีโปรแกรมในวอลเล็ต" : "Your wallet is empty"}</p><p className="mt-2 text-sm leading-6 text-zinc-500">{locale === "th" ? "สร้างโปรแกรมของคุณเอง หรือเข้าร่วมโปรแกรมผ่าน QR" : "Create your own program or join one with a QR code."}</p><div className="mt-4 flex justify-center gap-2"><Link href="/programs/new"><Button>{m.createProgram}</Button></Link><Link href="/scan"><Button variant="secondary">{locale === "th" ? "สแกน QR" : "Scan QR"}</Button></Link></div></div>}
        {(memberships ?? []).slice(0,3).map((membership) => {
          const program = Array.isArray(membership.programs) ? membership.programs[0] : membership.programs;
          if (!program) return null;
          const account = accountMap.get(program.id);
          const stamp = stampMap.get(program.id);
          return <ProgramCard key={program.id} href={`/programs/${program.slug}`} locale={locale} name={program.name} subtitle={program.program_type === "stamps" ? (locale === "th" ? "บัตรสแตมป์" : "Stamp card") : program.currency_name} balance={program.program_type !== "stamps" ? Math.max(0,(account?.balance ?? 0)-(account?.reserved_balance ?? 0)) : undefined} stamps={program.program_type !== "points" && stamp?.required ? { current: stamp.stamp_count, required: stamp.required } : undefined}/>;
        })}
      </section>

      <Link href="/programs/new" className="mt-4 block"><Button variant="secondary" className="w-full gap-2"><Plus className="size-4"/>{m.createProgram}</Button></Link>

      <section className="mt-9">
        <div className="flex items-center justify-between gap-4"><h2 className="font-semibold">{m.recent}</h2><Link href="/activity" className="shrink-0 text-sm text-emerald-700 dark:text-emerald-300">{m.seeAll}</Link></div>
        {activity.length === 0 ? <p className="mt-3 rounded-[24px] border border-dashed border-zinc-300 p-5 text-sm text-zinc-500 dark:border-zinc-700">{locale === "th" ? "ยังไม่มีกิจกรรม" : "No activity yet."}</p> :
        <div className="mt-3 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
          {activity.map((row) => <div key={row.id} className="flex min-w-0 items-center gap-3 py-4"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{row.amount > 0 ? "+" : ""}{row.amount}</div><div className="min-w-0 flex-1"><p className="truncate font-medium">{row.name}</p><p className="truncate text-sm text-zinc-500">{row.note} · {row.unit}</p></div><ChevronRight className="size-4 shrink-0 text-zinc-400"/></div>)}
        </div>}
      </section>
    </main>
  );
}
