import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LogOut, Mail, QrCode, Settings, ShieldCheck, Sparkles, Store, WalletCards } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const locale = await getLocale();
  const th = locale === "th";
  const m = messages[locale].profile;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: profile }, memberships, ownedPrograms] = await Promise.all([
    supabase.from("profiles").select("display_name,username,avatar_url,password_set").eq("id", auth.user.id).maybeSingle(),
    supabase.from("program_members").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id).eq("status", "active"),
    supabase.from("programs").select("id", { count: "exact", head: true }).eq("owner_id", auth.user.id),
  ]);

  const displayName = profile?.display_name || profile?.username || auth.user.email?.split("@")[0] || m.fallbackName;
  const username = profile?.username ? `@${profile.username}` : "@pumppoint";
  const links = [
    [QrCode, m.myQr, th ? "สแกนเพื่อรับหรือใช้สิทธิ์" : "Scan to collect or redeem", "/scan", "bg-mint-soft text-emerald-700 dark:text-emerald-200"],
    [Store, m.myPrograms, th ? "สร้างและจัดการโปรแกรมของคุณ" : "Create and manage your programs", "/programs/new", "bg-reward-soft text-amber-700 dark:text-amber-200"],
    [ShieldCheck, th ? "ความปลอดภัย" : "Security", th ? "รหัสผ่านและการเข้าสู่ระบบ" : "Password and sign-in", "/settings/security", "bg-lavender-soft text-violet-700 dark:text-violet-200"],
    [Settings, m.settings, th ? "ภาษา ธีม และการตั้งค่า" : "Language, theme and preferences", "/settings", "bg-coral-soft text-rose-600 dark:text-rose-200"],
  ] as const;

  return (
    <main className="page-wrap min-w-0">
      <section className="cute-card overflow-hidden p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[22px] bg-[#F7F9FC] shadow-sm ring-1 ring-slate-200">{profile?.avatar_url ? <Image src={profile.avatar_url} alt="" width={80} height={80} className="size-20 object-cover" unoptimized/> : <Image src="/pumppoint-mark.svg" alt="" width={72} height={72}/>}</div>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Sparkles className="size-4 text-amber-500"/><span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">PumpPoint member</span></div><h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.04em]">{displayName}</h1><p className="truncate text-sm font-medium text-zinc-500">{username}</p><div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><Mail className="size-3.5"/><span className="truncate">{auth.user.email}</span></div></div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-mint-soft p-3 text-center"><p className="text-2xl font-semibold text-emerald-800 dark:text-emerald-200">{memberships.count ?? 0}</p><p className="mt-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{th ? "การ์ด" : "Cards"}</p></div>
          <div className="rounded-2xl bg-reward-soft p-3 text-center"><p className="text-2xl font-semibold text-amber-800 dark:text-amber-200">{ownedPrograms.count ?? 0}</p><p className="mt-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{th ? "โปรแกรม" : "Programs"}</p></div>
          <div className="rounded-2xl bg-lavender-soft p-3 text-center"><p className="text-2xl font-semibold text-violet-800 dark:text-violet-200">{profile?.password_set ? "✓" : "–"}</p><p className="mt-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">{th ? "รหัสผ่าน" : "Password"}</p></div>
        </div>
      </section>

      <div className="mt-6 grid gap-3">
        {links.map(([Icon,label,copy,href,tone]) => <Link key={href} href={href} className="cute-card flex min-w-0 items-center gap-3 p-4 shadow-none"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="size-5"/></span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{label}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{copy}</p></div><ChevronRight className="size-4 shrink-0 text-zinc-400"/></Link>)}
      </div>

      <Link href="/wallet" className="cute-secondary mt-5 flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><WalletCards className="size-4"/>{th ? "เปิดวอลเล็ตของฉัน" : "Open my wallet"}</Link>
      <form action={signOut} className="mt-3"><button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 font-semibold text-rose-700 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-200"><LogOut className="size-4"/>{th ? "ออกจากระบบ" : "Sign out"}</button></form>
    </main>
  );
}
