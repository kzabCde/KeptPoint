import Link from "next/link";
import { ArrowLeft, Coins, Gift, History, QrCode, Sparkles, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function ManageProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const th = locale === "th";
  const m = messages[locale].manage;
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name,program_type,currency_name").eq("slug", slug).single();
  if (!program) return <main className="p-6">{th ? "ไม่พบโปรแกรม" : "Program not found."}</main>;

  const [members, rewards, pending, issued, recent] = await Promise.all([
    supabase.from("program_members").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("status", "active"),
    supabase.from("rewards").select("id", { count: "exact", head: true }).eq("program_id", program.id).eq("active", true),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("program_id", program.id).in("status", ["pending","reserved"]),
    supabase.from("point_transactions").select("amount").eq("program_id", program.id).gt("amount", 0),
    supabase.from("point_transactions").select("id,amount,type,created_at,profiles:user_id(display_name,username)").eq("program_id", program.id).order("created_at", { ascending: false }).limit(3),
  ]);

  const totalIssued = (issued.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const links = [
    [UsersRound, m.members, th ? "ค้นหาสมาชิกและออกแต้ม/สแตมป์" : "Search members and issue points/stamps", `/programs/${slug}/manage/members`, "bg-mint-soft text-emerald-700 dark:text-emerald-200"],
    [Gift, m.rewards, m.rewardsCopy, `/programs/${slug}/manage/rewards`, "bg-reward-soft text-amber-700 dark:text-amber-200"],
    [QrCode, th ? "QR / Scanner" : "QR / Scanner", th ? "สร้าง QR สำหรับแต้ม สแตมป์ และเข้าร่วม" : "Generate secure codes for points, stamps, and joining", `/programs/${slug}/manage/qr`, "bg-lavender-soft text-blue-600 dark:text-blue-200"],
    [History, m.redemptions, m.redemptionsCopy, `/programs/${slug}/manage/redemptions`, "bg-lavender-soft text-violet-700 dark:text-violet-200"],
  ] as const;

  return (
    <main className="mx-auto min-h-dvh max-w-5xl overflow-x-hidden px-5 py-6 lg:px-8 lg:py-8">
      <Link href={`/programs/${slug}`} aria-label={th ? "กลับหน้าโปรแกรม" : "Back to program"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
      <div className="mt-6 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Sparkles className="size-4"/>{m.eyebrow}</div><h1 className="mt-1 break-words text-3xl font-semibold tracking-[-0.045em]">{program.name}</h1><p className="mt-2 text-sm text-zinc-500">{program.program_type}</p></div><span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-[#0F2D46] text-lg font-bold text-white">{program.name.slice(0,1).toUpperCase()}</span></div>

      <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="cute-card p-4 shadow-none"><UsersRound className="size-5 text-emerald-600"/><p className="mt-4 text-2xl font-semibold">{members.count ?? 0}</p><p className="mt-1 text-xs text-zinc-500">{th ? "สมาชิกที่ใช้งาน" : "Active members"}</p></div>
        <div className="cute-card p-4 shadow-none"><Coins className="size-5 text-violet-600"/><p className="mt-4 truncate text-2xl font-semibold">{totalIssued.toLocaleString(th ? "th-TH" : "en-US")}</p><p className="mt-1 text-xs text-zinc-500">{th ? `แจก ${program.currency_name} แล้ว` : `${program.currency_name} issued`}</p></div>
        <div className="cute-card p-4 shadow-none"><Gift className="size-5 text-amber-600"/><p className="mt-4 text-2xl font-semibold">{rewards.count ?? 0}</p><p className="mt-1 text-xs text-zinc-500">{th ? "รางวัลที่เปิดใช้" : "Active rewards"}</p></div>
        <div className="cute-card p-4 shadow-none"><History className="size-5 text-rose-500"/><p className="mt-4 text-2xl font-semibold">{pending.count ?? 0}</p><p className="mt-1 text-xs text-zinc-500">{th ? "รอยืนยันการแลก" : "Pending redemptions"}</p></div>
      </section>

      <div className="mt-7 grid gap-3 md:grid-cols-2">{links.map(([Icon,title,copy,href,tone]) => <Link key={title} href={href} className="cute-card flex min-w-0 items-center gap-4 p-4 shadow-none"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="size-5"/></span><div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="mt-1 break-words text-xs leading-5 text-zinc-500">{copy}</p></div><span className="text-lg text-zinc-400">›</span></Link>)}</div>

      <section className="mt-8">
        <h2 className="section-title">{th ? "กิจกรรมล่าสุด" : "Recent activity"}</h2>
        {(recent.data ?? []).length === 0 ? <div className="cute-card mt-3 p-5 text-sm text-zinc-500 shadow-none">{th ? "ยังไม่มีการออกแต้ม รายการแรกจะมาแสดงตรงนี้" : "No point activity yet. Your first issue will appear here."}</div> : <div className="cute-card mt-3 divide-y divide-zinc-200/70 px-4 shadow-none dark:divide-white/10">{(recent.data ?? []).map((row) => { const user = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles; const name = user?.display_name || user?.username || (th ? "สมาชิก" : "Member"); return <div key={row.id} className="flex min-w-0 items-center gap-3 py-4"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-mint-soft text-xs font-bold text-emerald-700">+{row.amount}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-zinc-500">{row.type} · {new Intl.DateTimeFormat(th ? "th-TH" : "en-US", { dateStyle: "medium" }).format(new Date(row.created_at))}</p></div></div>; })}</div>}
      </section>
    </main>
  );
}
