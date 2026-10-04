import Link from "next/link";
import { ArrowLeft, AtSign, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Create account" };

const errors = {
  "invalid-fields": { th: "กรุณาตรวจ Username และอีเมลอีกครั้ง Username ใช้ a-z, 0-9 และ _ จำนวน 3–30 ตัว", en: "Check your username and email. Username must use a-z, 0-9 or _ and be 3–30 characters." },
  "signup-failed": { th: "ยังส่งลิงก์ยืนยันไม่ได้ กรุณาลองใหม่อีกครั้ง", en: "Could not send the verification link. Please try again." },
  "email-rate-limit": { th: "ระบบส่งอีเมลถึงขีดจำกัดชั่วคราว กรุณารอสักครู่แล้วลองอีกครั้ง", en: "Email sending is temporarily rate-limited. Wait a little and try again." },
} as const;

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errors }> }) {
  const locale = await getLocale();
  const { error } = await searchParams;
  const th = locale === "th";

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Link href="/login" aria-label={th ? "กลับหน้าเข้าสู่ระบบ" : "Back to sign in"} className="cute-icon-button"><ArrowLeft className="size-4"/></Link>
        <div className="mt-6"><Brand/></div>
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-200"><Sparkles className="size-4"/>{th ? "เริ่มสะสมความคุ้มค่า" : "Start keeping every reward"}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em]">{th ? "สร้างบัญชี KeptPoint" : "Create your KeptPoint account"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "ขั้นแรกเลือก Username และยืนยันอีเมลด้วยลิงก์ครั้งเดียว จากนั้นคุณจะตั้งรหัสผ่านสำหรับใช้เข้าสู่ระบบทุกวัน" : "Choose a username and verify your email once. Then you’ll create a password for everyday sign-ins."}</p>

          {error && errors[error] && <div role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errors[error][locale]}</div>}

          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-zinc-500">
            <div className="rounded-2xl bg-mint-soft px-2 py-3 text-emerald-800 dark:text-emerald-200">1 · {th ? "บัญชี" : "Account"}</div>
            <div className="rounded-2xl bg-lavender-soft px-2 py-3 text-violet-800 dark:text-violet-200">2 · {th ? "ยืนยันเมล" : "Verify"}</div>
            <div className="rounded-2xl bg-reward-soft px-2 py-3 text-amber-800 dark:text-amber-200">3 · {th ? "ตั้งรหัสผ่าน" : "Password"}</div>
          </div>

          <form action={signUpWithEmail} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">Username<div className="cute-input flex items-center gap-2 px-4"><AtSign className="size-4 shrink-0 text-emerald-600"/><input name="username" required minLength={3} maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 min-w-0 flex-1 bg-transparent outline-none" placeholder="kept_user"/></div><span className="text-xs font-normal leading-5 text-zinc-500">{th ? "ใช้ a–z, ตัวเลข และ _ ระบบจะแปลงตัวพิมพ์ใหญ่เป็นตัวเล็กให้" : "Use a-z, numbers and _. Uppercase letters are normalized."}</span></label>
            <label className="grid gap-2 text-sm font-semibold">{th ? "อีเมล" : "Email"}<div className="cute-input flex items-center gap-2 px-4"><Mail className="size-4 shrink-0 text-emerald-600"/><input name="email" type="email" required autoComplete="email" className="h-12 min-w-0 flex-1 bg-transparent outline-none" placeholder="you@example.com"/></div></label>

            <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p>{th ? "ยังไม่ต้องตั้งรหัสผ่านตอนนี้ ลิงก์ในอีเมลใช้ยืนยันตัวตนเพียงครั้งแรก หลังจากนั้นระบบจะให้ตั้งรหัสผ่าน" : "No password yet. The email link verifies you once, then KeptPoint will ask you to create a password."}</p></div></div>
            <button className="cute-primary inline-flex h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><Mail className="size-4"/>{th ? "ไปต่อและส่งลิงก์ยืนยัน" : "Continue & send verification link"}</button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">{th ? "มีบัญชีแล้ว?" : "Already have an account?"} <Link href="/login" className="font-semibold text-emerald-700 dark:text-emerald-300">{th ? "เข้าสู่ระบบ" : "Sign in"}</Link></p>
        </section>
      </div>
    </main>
  );
}
