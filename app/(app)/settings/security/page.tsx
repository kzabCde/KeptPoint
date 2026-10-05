import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { changePassword } from "@/app/actions/security";
import { PasswordFields } from "@/components/password-fields";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Security" };

const errorText = {
  "invalid-password": { th: "กรุณาตรวจรหัสผ่านใหม่อีกครั้ง", en: "Check the new password and try again." },
  "password-same": { th: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม", en: "Your new password must be different from your current password." },
  "password-weak": { th: "รหัสผ่านใหม่ยังไม่ผ่านข้อกำหนดความปลอดภัย กรุณาใช้รหัสผ่านที่คาดเดายากขึ้น", en: "The new password does not meet the security requirements. Choose a stronger password." },
  "password-update-failed": { th: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่", en: "Could not change the password. Please try again." },
  "profile-update-failed": { th: "เปลี่ยนรหัสผ่านแล้ว แต่สถานะบัญชียังอัปเดตไม่ครบ", en: "The password changed, but account state could not be fully updated." },
} as const;

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: keyof typeof errorText }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const { status, error } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const verified = Boolean(auth.user.email_confirmed_at);

  return (
    <main className="min-w-0 px-5 py-6">
      <Link href="/settings" aria-label={th ? "กลับหน้าการตั้งค่า" : "Back to settings"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
      <div className="mt-6">
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{th ? "บัญชีของฉัน" : "My account"}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">{th ? "ความปลอดภัย" : "Security"}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "จัดการรหัสผ่านและสถานะการยืนยันอีเมลของ KeptPoint" : "Manage your password and KeptPoint email verification status."}</p>
      </div>

      <section className="cute-card mt-6 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-soft text-emerald-700 dark:text-emerald-200"><Mail className="size-5"/></span>
          <div className="min-w-0 flex-1"><p className="text-xs font-medium text-zinc-500">{th ? "อีเมลบัญชี" : "Account email"}</p><p className="mt-1 break-all font-semibold">{auth.user.email}</p></div>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${verified ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"}`}><BadgeCheck className="size-3.5"/>{verified ? (th ? "ยืนยันแล้ว" : "Verified") : (th ? "รอยืนยัน" : "Pending")}</span>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/5"><ShieldCheck className="size-5 text-emerald-600"/><p className="text-sm text-zinc-600 dark:text-zinc-300">{th ? "บัญชี KeptPoint ใช้ Email + Password สำหรับการเข้าสู่ระบบปกติ ลิงก์อีเมลใช้เฉพาะการยืนยันบัญชีใหม่และการกู้รหัสผ่าน" : "KeptPoint uses Email + Password for normal sign-in. Email links are only for new-account verification and password recovery."}</p></div>
      </section>

      {status === "password-changed" && <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">{th ? "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" : "Password changed successfully."}</p>}
      {error && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorText[error][locale]}</p>}

      <section className="cute-card mt-5 p-5">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"><KeyRound className="size-5"/></span><div><h2 className="font-semibold">{th ? "เปลี่ยนรหัสผ่าน" : "Change password"}</h2><p className="mt-0.5 text-xs text-zinc-500">{th ? "ตั้งรหัสผ่านใหม่ที่ต่างจากรหัสเดิมสำหรับการเข้าสู่ระบบครั้งถัดไป" : "Choose a new password that differs from your current password."}</p></div></div>
        <form action={changePassword} className="mt-5 grid gap-5">
          <PasswordFields locale={locale}/>
          <button className="cute-primary h-12 rounded-2xl font-semibold">{th ? "เปลี่ยนรหัสผ่าน" : "Change password"}</button>
        </form>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/forgot-password" className="cute-secondary flex min-h-12 items-center justify-center rounded-2xl px-4 text-sm font-semibold">{th ? "ส่งลิงก์รีเซ็ตรหัสผ่าน" : "Send reset link"}</Link>
        <form action={signOut}><button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-200"><LogOut className="size-4"/>{th ? "ออกจากระบบ" : "Sign out"}</button></form>
      </div>
    </main>
  );
}
