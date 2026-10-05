import Link from "next/link";
import { ArrowLeft, MailQuestion, ShieldCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const locale = await getLocale();
  const { status, error } = await searchParams;
  const th = locale === "th";

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/login" aria-label={th ? "กลับหน้าเข้าสู่ระบบ" : "Back to sign in"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
        <div className="mt-6"><Brand/></div>
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="grid size-14 place-items-center rounded-[20px] bg-coral-soft text-rose-600 dark:text-rose-200"><MailQuestion className="size-7"/></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{th ? "ลืมรหัสผ่าน?" : "Forgot your password?"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "กรอกอีเมลของบัญชี PumpPoint เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้" : "Enter the email for your PumpPoint account and we’ll send a secure reset link."}</p>

          {status === "sent" && (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">
              <div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p>{th ? "หากมีบัญชีที่ใช้อีเมลนี้ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่แล้ว กรุณาตรวจกล่องข้อความและสแปม" : "If an account uses this email, a password reset link has been sent. Check your inbox and spam folder."}</p></div>
            </div>
          )}
          {status === "session-required" && <p role="alert" className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{th ? "ลิงก์รีเซ็ตยังไม่ได้สร้าง session กรุณาเปิดลิงก์ล่าสุดจากอีเมลอีกครั้ง หรือส่งลิงก์ใหม่" : "The reset link did not establish a recovery session. Open the latest email link again or request a new one."}</p>}
          {error === "recovery-link-invalid" && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{th ? "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หมดอายุ หรือถูกใช้แล้ว กรุณาส่งลิงก์ใหม่" : "The reset link is invalid, expired, or already used. Request a new reset link."}</p>}
          {error === "email-rate-limit" && <p role="alert" className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{th ? "ระบบส่งอีเมลถึงขีดจำกัดชั่วคราว กรุณารอสักครู่แล้วลองใหม่" : "Email sending is temporarily rate-limited. Please wait and try again."}</p>}
          {error === "email-required" && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{th ? "กรุณากรอกอีเมล" : "Enter your email."}</p>}

          <form action={requestPasswordReset} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              {th ? "อีเมล" : "Email"}
              <input name="email" type="email" required autoComplete="email" className="cute-input h-12 px-4 outline-none" placeholder="you@example.com"/>
            </label>
            <button className="cute-primary h-12 rounded-2xl font-semibold">{th ? "ส่งลิงก์รีเซ็ตรหัสผ่าน" : "Send reset link"}</button>
          </form>
          <Link href="/login" className="mt-4 flex min-h-11 items-center justify-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">{th ? "กลับไปเข้าสู่ระบบ" : "Back to sign in"}</Link>
        </section>
      </div>
    </main>
  );
}
