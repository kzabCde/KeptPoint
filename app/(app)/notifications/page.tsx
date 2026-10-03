import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata={title:"Notifications"};

export default async function NotificationsPage(){
  const locale=await getLocale();
  const supabase=await createClient();
  const {data:auth}=await supabase.auth.getUser();
  if(!auth.user) redirect("/login");
  const {data:rows}=await supabase.from("notifications").select("id,title,message,type,read_at,created_at").eq("user_id",auth.user.id).order("created_at",{ascending:false}).limit(100);
  return <main className="min-w-0 px-5 py-6"><div className="flex items-center justify-between gap-3"><Link href="/home" className="grid size-10 place-items-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>{(rows??[]).some(x=>!x.read_at)&&<form action={markAllNotificationsRead}><button className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{locale==="th"?"อ่านทั้งหมดแล้ว":"Mark all read"}</button></form>}</div><h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{locale==="th"?"การแจ้งเตือน":"Notifications"}</h1>{(rows??[]).length===0?<div className="mt-6 rounded-[24px] border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700"><Bell className="mx-auto size-7 text-zinc-400"/><p className="mt-3 text-sm text-zinc-500">{locale==="th"?"ยังไม่มีการแจ้งเตือน":"No notifications yet."}</p></div>:<div className="mt-5 divide-y divide-zinc-200 rounded-[24px] border border-zinc-200 bg-white px-4 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">{(rows??[]).map(row=><div key={row.id} className="py-4"><div className="flex items-start gap-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${row.read_at?"bg-zinc-300":"bg-emerald-500"}`}/><div className="min-w-0"><p className="break-words font-medium">{row.title}</p><p className="mt-1 break-words text-sm leading-6 text-zinc-500">{row.message}</p><p className="mt-1 text-xs text-zinc-400">{new Intl.DateTimeFormat(locale==="th"?"th-TH":"en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(row.created_at))}</p></div></div></div>)}</div>}</main>;
}
