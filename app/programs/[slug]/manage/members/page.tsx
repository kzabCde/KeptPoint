import Link from "next/link";
import { ArrowLeft, Coins, Stamp } from "lucide-react";
import { issuePointsForm, issueStampForm } from "@/app/actions/loyalty";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export default async function MembersPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { slug }=await params;
  const { ok }=await searchParams;
  const locale=await getLocale();
  const supabase=await createClient();
  const { data:program }=await supabase.from("programs").select("id,name,program_type,currency_name").eq("slug",slug).single();
  if(!program) return <main className="p-6">{locale==="th"?"ไม่พบโปรแกรม":"Program not found."}</main>;
  const { data:members,error }=await supabase.rpc("list_program_members",{p_program_id:program.id});
  if(error) return <main className="p-6">{locale==="th"?"ไม่มีสิทธิ์ดูสมาชิก":"You do not have permission to view members."}</main>;
  const canPoints=program.program_type==="points"||program.program_type==="hybrid";
  const canStamps=program.program_type==="stamps"||program.program_type==="hybrid";
  return <main className="mx-auto min-h-dvh max-w-xl overflow-x-hidden px-5 py-6">
    <Link href={"/programs/" + slug + "/manage"} className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>
    <h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{locale==="th"?"สมาชิก":"Members"}</h1>
    <p className="mt-2 break-words text-sm text-zinc-500">{program.name} · {(members??[]).length} {locale==="th"?"สมาชิก":"members"}</p>
    {ok&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">{locale==="th"?"บันทึกรายการสำเร็จ":"Transaction completed."}</div>}
    <div className="mt-6 grid gap-4">
      {(members??[]).map(member=><section key={member.user_id} className="min-w-0 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{member.display_name}</p><p className="truncate text-xs text-zinc-500">{member.username ? "@" + member.username : member.user_id.slice(0,8) + "…"}</p></div><span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{member.member_status}</span></div>
        {canPoints&&<p className="mt-3 text-sm text-zinc-500">{locale==="th"?"ยอดใช้ได้":"Available"}: <strong className="text-zinc-900 dark:text-zinc-100">{Math.max(0,member.balance-member.reserved_balance)} {program.currency_name}</strong></p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {canPoints&&<form action={issuePointsForm} className="grid min-w-0 grid-cols-[1fr_auto] gap-2"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="memberId" value={member.user_id}/><input type="hidden" name="slug" value={slug}/><input name="amount" type="number" min="1" max="1000000" required placeholder={locale==="th"?"จำนวนแต้ม":"Points"} className="h-10 min-w-0 rounded-xl border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800"/><button className="inline-flex h-10 items-center gap-1 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950"><Coins className="size-3.5"/>{locale==="th"?"ให้แต้ม":"Issue"}</button></form>}
          {canStamps&&<form action={issueStampForm} className="grid min-w-0 grid-cols-[1fr_auto] gap-2"><input type="hidden" name="programId" value={program.id}/><input type="hidden" name="memberId" value={member.user_id}/><input type="hidden" name="slug" value={slug}/><input name="amount" type="number" min="1" max="100" defaultValue="1" required className="h-10 min-w-0 rounded-xl border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800"/><button className="inline-flex h-10 items-center gap-1 rounded-xl border border-emerald-300 px-3 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"><Stamp className="size-3.5"/>{locale==="th"?"ให้สแตมป์":"Stamp"}</button></form>}
        </div>
      </section>)}
    </div>
  </main>;
}
