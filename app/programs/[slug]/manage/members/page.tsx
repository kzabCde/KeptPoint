import { randomUUID } from "node:crypto";
import Link from "next/link";
import { ArrowLeft, Coins, Search, Stamp, UsersRound } from "lucide-react";
import { issuePointsForm, issueStampForm } from "@/app/actions/loyalty";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export default async function MembersPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; q?: string }> }) {
  const { slug } = await params;
  const { ok, q = "" } = await searchParams;
  const locale = await getLocale();
  const th = locale === "th";
  const supabase = await createClient();
  const { data: program } = await supabase.from("programs").select("id,name,program_type,currency_name").eq("slug",slug).single();
  if (!program) return <main className="p-6">{th ? "ไม่พบโปรแกรม" : "Program not found."}</main>;
  const { data: members, error } = await supabase.rpc("list_program_members", { p_program_id: program.id });
  if (error) return <main className="p-6">{th ? "ไม่มีสิทธิ์ดูสมาชิก" : "You do not have permission to view members."}</main>;

  const normalized = q.trim().toLowerCase();
  const visibleMembers = (members ?? []).filter((member) => {
    if (!normalized) return true;
    return member.display_name.toLowerCase().includes(normalized) || (member.username ?? "").toLowerCase().includes(normalized);
  });
  const canPoints = program.program_type === "points" || program.program_type === "hybrid";
  const canStamps = program.program_type === "stamps" || program.program_type === "hybrid";

  return (
    <main className="mx-auto min-h-dvh max-w-5xl overflow-x-hidden px-5 py-6 lg:px-8 lg:py-8">
      <Link href={`/programs/${slug}/manage`} aria-label={th ? "กลับหน้าจัดการ" : "Back to manage"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
      <div className="mt-6 flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{program.name}</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{th ? "สมาชิก" : "Members"}</h1><p className="mt-2 text-sm text-zinc-500">{(members ?? []).length} {th ? "สมาชิกที่พบ" : "members"}</p></div><span className="grid size-12 place-items-center rounded-[18px] bg-mint-soft text-emerald-700 dark:text-emerald-200"><UsersRound className="size-6"/></span></div>

      {ok && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">{th ? "บันทึกรายการสำเร็จ ✨" : "Transaction completed ✨"}</div>}

      <form className="mt-5 flex min-w-0 gap-2"><label className="cute-input flex h-12 min-w-0 flex-1 items-center gap-3 px-4"><Search className="size-4 shrink-0 text-zinc-400"/><input name="q" defaultValue={q} placeholder={th ? "ค้นหาชื่อหรือ Username" : "Search name or username"} className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label><button className="cute-primary shrink-0 rounded-2xl px-4 text-sm font-semibold">{th ? "ค้นหา" : "Search"}</button></form>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {visibleMembers.length === 0 && <div className="cute-card p-7 text-center shadow-none"><UsersRound className="mx-auto size-8 text-zinc-400"/><h2 className="mt-3 font-semibold">{th ? "ยังไม่พบสมาชิก" : "No members found"}</h2><p className="mt-2 text-sm text-zinc-500">{normalized ? (th ? "ลองค้นหาด้วยชื่ออื่น" : "Try another search.") : (th ? "เมื่อมีคนเข้าร่วมโปรแกรม รายชื่อจะมาอยู่ตรงนี้" : "Members will appear here after joining the program.")}</p></div>}
        {visibleMembers.map((member) => <section key={member.user_id} className="cute-card min-w-0 p-4 shadow-none">
          <div className="flex min-w-0 items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lavender-soft font-bold text-violet-700 dark:text-violet-200">{member.display_name.slice(0,1).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-semibold">{member.display_name}</p><p className="truncate text-xs text-zinc-500">{member.username ? `@${member.username}` : (th ? "ยังไม่มี Username" : "No username")}</p></div></div><span className="soft-chip shrink-0">{member.member_status}</span></div>
          {canPoints && <div className="mt-4 rounded-2xl bg-mint-soft px-4 py-3"><p className="text-xs text-zinc-600 dark:text-zinc-300">{th ? "ยอดใช้ได้" : "Available"}</p><p className="mt-1 text-xl font-semibold text-emerald-800 dark:text-emerald-200">{Math.max(0, member.balance-member.reserved_balance).toLocaleString(th ? "th-TH" : "en-US")} <span className="text-xs">{program.currency_name}</span></p></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {canPoints && <form action={issuePointsForm} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="memberId" value={member.user_id}/><input type="hidden" name="slug" value={slug}/><input type="hidden" name="idempotencyKey" value={randomUUID()}/><input name="amount" type="number" min="1" max="1000000" required placeholder={th ? "จำนวนแต้ม" : "Points"} className="cute-input h-11 min-w-0 px-3 text-sm outline-none"/><PendingSubmitButton pendingLabel={th ? "กำลังให้…" : "Issuing…"} className="cute-primary inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold"><Coins className="size-3.5"/>{th ? "ให้แต้ม" : "Issue"}</PendingSubmitButton></form>}
            {canStamps && <form action={issueStampForm} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="memberId" value={member.user_id}/><input type="hidden" name="slug" value={slug}/><input type="hidden" name="idempotencyKey" value={randomUUID()}/><input name="amount" type="number" min="1" max="100" defaultValue="1" required className="cute-input h-11 min-w-0 px-3 text-sm outline-none"/><PendingSubmitButton pendingLabel={th ? "กำลังให้…" : "Issuing…"} className="cute-secondary inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><Stamp className="size-3.5"/>{th ? "ให้สแตมป์" : "Stamp"}</PendingSubmitButton></form>}
          </div>
        </section>)}
      </div>
    </main>
  );
}
