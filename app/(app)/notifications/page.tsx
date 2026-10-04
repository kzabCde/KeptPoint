import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell, CheckCheck, Sparkles } from "lucide-react";
import { markAllNotificationsRead } from "@/app/actions/notifications";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const locale = await getLocale();
  const th = locale === "th";
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: rows } = await supabase.from("notifications").select("id,title,message,type,read_at,created_at").eq("user_id",auth.user.id).order("created_at",{ascending:false}).limit(100);
  const unread = (rows ?? []).filter((row) => !row.read_at).length;

  return (
    <main className="min-w-0 px-5 py-6">
      <div className="flex items-center justify-between gap-3"><Link href="/home" aria-label={th ? "กลับหน้าแรก" : "Back home"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>{unread > 0 && <form action={markAllNotificationsRead}><button className="cute-secondary inline-flex min-h-11 items-center gap-2 rounded-2xl px-3 text-xs font-semibold"><CheckCheck className="size-4"/>{th ? "อ่านทั้งหมดแล้ว" : "Mark all read"}</button></form>}</div>
      <div className="mt-6 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-200"><Sparkles className="size-4"/>{unread > 0 ? (th ? `${unread} รายการใหม่` : `${unread} new`) : (th ? "อัปเดตครบแล้ว" : "All caught up")}</div><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{th ? "การแจ้งเตือน" : "Notifications"}</h1></div><span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-lavender-soft text-violet-700 dark:text-violet-200"><Bell className="size-6"/></span></div>
      {(rows ?? []).length === 0 ? <div className="cute-card mt-6 p-8 text-center shadow-none"><div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-mint-soft text-emerald-700"><Bell className="size-7"/></div><h2 className="mt-4 font-semibold">{th ? "ยังไม่มีอะไรใหม่" : "Nothing new yet"}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{th ? "เมื่อมีแต้ม รางวัล หรือข่าวจากโปรแกรม เราจะเก็บไว้ตรงนี้" : "Points, rewards and program updates will appear here."}</p></div> : <div className="cute-card mt-5 divide-y divide-zinc-200/70 px-4 shadow-none dark:divide-white/10">{(rows ?? []).map((row) => <div key={row.id} className="py-4"><div className="flex items-start gap-3"><span className={`mt-1 grid size-9 shrink-0 place-items-center rounded-2xl ${row.read_at ? "bg-zinc-100 text-zinc-400 dark:bg-white/5" : "bg-mint-soft text-emerald-700 dark:text-emerald-200"}`}><Bell className="size-4"/></span><div className="min-w-0"><div className="flex items-center gap-2"><p className="break-words font-semibold">{row.title}</p>{!row.read_at && <span className="size-2 shrink-0 rounded-full bg-emerald-500"/>}</div><p className="mt-1 break-words text-sm leading-6 text-zinc-500">{row.message}</p><p className="mt-1 text-xs text-zinc-400">{new Intl.DateTimeFormat(th?"th-TH":"en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(row.created_at))}</p></div></div></div>)}</div>}
    </main>
  );
}
