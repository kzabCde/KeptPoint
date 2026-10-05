import Link from "next/link";
import { ArrowLeft, Bell, ChevronRight, Info, Languages, MoonStar, ShieldCheck, UserRound } from "lucide-react";
import { SettingsPreferences } from "@/components/settings-preferences";
import { getPreferences } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function SettingsPage() {
  const preferences = await getPreferences();
  const m = messages[preferences.locale].settings;
  const th = preferences.locale === "th";
  const links = [
    [UserRound, th ? "บัญชี" : "Account", th ? "ดูโปรไฟล์และข้อมูลบัญชี" : "Profile and account information", "/profile", "bg-mint-soft text-emerald-700 dark:text-emerald-200"],
    [ShieldCheck, th ? "ความปลอดภัย" : "Security", th ? "รหัสผ่าน การยืนยันอีเมล และการเข้าสู่ระบบ" : "Password, email verification and sign-in", "/settings/security", "bg-reward-soft text-amber-700 dark:text-amber-200"],
    [Bell, th ? "การแจ้งเตือน" : "Notifications", th ? "ดูการแจ้งเตือนล่าสุดของคุณ" : "Review your latest notifications", "/notifications", "bg-lavender-soft text-violet-700 dark:text-violet-200"],
  ] as const;

  return (
    <main className="page-wrap min-w-0">
      <Link href="/profile" aria-label={th ? "กลับโปรไฟล์" : "Back to profile"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
      <div className="mt-6"><p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">PumpPoint</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{m.title}</h1><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{m.description}</p></div>

      <section className="mt-6 grid gap-3">
        {links.map(([Icon,title,copy,href,tone]) => <Link key={href} href={href} className="cute-card flex min-w-0 items-center gap-3 p-4 shadow-none"><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon className="size-5"/></span><div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="mt-0.5 break-words text-xs leading-5 text-zinc-500">{copy}</p></div><ChevronRight className="size-4 shrink-0 text-zinc-400"/></Link>)}
      </section>

      <section className="mt-7">
        <div className="flex items-center gap-2"><MoonStar className="size-5 text-violet-600"/><h2 className="section-title">{th ? "ภาษาและรูปลักษณ์" : "Language & appearance"}</h2></div>
        <div className="cute-card mt-3 overflow-hidden p-1 shadow-none"><div className="flex items-center gap-2 px-4 pt-4 text-xs font-semibold text-zinc-500"><Languages className="size-4"/>{th ? "การตั้งค่าจะซิงก์กับบัญชีนี้" : "Preferences sync with this account"}</div><SettingsPreferences initialLocale={preferences.locale} initialTheme={preferences.theme}/></div>
      </section>

      <section className="mt-7 cute-card p-5 shadow-none">
        <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-coral-soft text-rose-600 dark:text-rose-200"><Info className="size-5"/></span><div><h2 className="font-semibold">{th ? "เกี่ยวกับ PumpPoint" : "About PumpPoint"}</h2><p className="mt-1 text-sm leading-6 text-zinc-500">{th ? "เก็บทุกแต้ม ทุกสแตมป์ และทุกความคุ้มค่าไว้ด้วยกัน" : "Keep every point, stamp and reward together."}</p><p className="mt-2 text-xs font-semibold text-zinc-400">v0.1.4</p></div></div>
      </section>

      <div className="mt-4 flex gap-3 rounded-[20px] bg-mint-soft p-4 text-sm text-emerald-900 dark:text-emerald-100"><ShieldCheck className="mt-0.5 size-5 shrink-0"/><p className="leading-6">{m.syncNote}</p></div>
    </main>
  );
}
