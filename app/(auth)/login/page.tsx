import Link from "next/link";
import { KeyRound, Mail, Sparkles } from "lucide-react";
import { loginWithEmail, loginWithGoogle, sendMagicLink } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Sign in" };

const errorText: Record<string, { th: string; en: string }> = {
  "missing-credentials": { th: "กรุณากรอกอีเมลและรหัสผ่าน", en: "Enter your email and password." },
  "password-short": { th: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", en: "Password must be at least 8 characters." },
  "invalid-credentials": { th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", en: "Email or password is incorrect." },
  "email-required": { th: "กรุณากรอกอีเมล", en: "Enter your email." },
  "magic-link-failed": { th: "ยังส่ง Magic Link ไม่ได้ กรุณาลองใหม่ภายหลัง", en: "Magic link could not be sent. Please try again later." },
  "email-rate-limit": { th: "ส่งอีเมลบ่อยเกินขีดจำกัด กรุณารอสักครู่ก่อนลองใหม่ ระหว่างนี้ยังเข้าสู่ระบบด้วยรหัสผ่านได้", en: "Email sending is temporarily rate-limited. Wait a little; password sign-in is still available." },
  "google-unavailable": { th: "Google Sign-in ยังไม่พร้อมใช้งาน", en: "Google sign-in is not available yet." },
  "confirm-link-invalid": { th: "ลิงก์ยืนยันไม่ถูกต้อง", en: "The confirmation link is invalid." },
  "confirm-link-expired": { th: "ลิงก์หมดอายุหรือถูกใช้แล้ว กรุณาขอลิงก์ใหม่", en: "The link expired or was already used. Request a new one." },
  "oauth": { th: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ", en: "Google sign-in failed." },
};

const statusText: Record<string, { th: string; en: string }> = {
  "magic-sent": { th: "ส่ง Magic Link แล้ว กรุณาตรวจสอบอีเมล", en: "Magic link sent. Check your email." },
  "signed-out": { th: "ออกจากระบบแล้ว", en: "You are signed out." },
  "session-required": { th: "กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ", en: "Sign in to continue." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const locale = await getLocale();
  const m = messages[locale].login;
  const { error, status } = await searchParams;
  const errorMessage = error ? errorText[error]?.[locale] : undefined;
  const statusMessage = status ? statusText[status]?.[locale] : undefined;
  const th = locale === "th";

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand />
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300"><Sparkles className="size-4"/>{th ? "ยินดีต้อนรับกลับมา" : "Welcome back"}</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.055em]">{m.title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "ใช้ Email + Password เป็นวิธีหลัก เข้าถึงแต้มและรางวัลได้ทันที" : "Use email + password as your everyday sign-in for instant access to points and rewards."}</p>

          {errorMessage && <div role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</div>}
          {statusMessage && <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">{statusMessage}</div>}

          <form action={loginWithEmail} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">{th ? "อีเมล" : "Email"}<div className="cute-input flex items-center gap-2 px-4"><Mail className="size-4 shrink-0 text-emerald-600"/><input name="email" type="email" autoComplete="email" required placeholder={m.email} className="h-12 min-w-0 flex-1 bg-transparent outline-none"/></div></label>
            <label className="grid gap-2 text-sm font-semibold">{th ? "รหัสผ่าน" : "Password"}<div className="cute-input flex items-center gap-2 px-4"><KeyRound className="size-4 shrink-0 text-emerald-600"/><input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder={m.password} className="h-12 min-w-0 flex-1 bg-transparent outline-none"/></div></label>
            <div className="flex justify-end"><Link href="/forgot-password" className="min-h-11 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{th ? "ลืมรหัสผ่าน?" : "Forgot password?"}</Link></div>
            <button className="cute-primary h-12 rounded-2xl font-semibold">{m.signIn}</button>
          </form>

          <Link href="/signup" className="cute-secondary mt-3 flex h-12 items-center justify-center rounded-2xl font-semibold">{th ? "สร้างบัญชีใหม่" : "Create account"}</Link>

          <div className="my-6 flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"/><span>{th ? "ทางเลือก" : "OR"}</span><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"/></div>

          <details className="group rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-white/5">
            <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-700 marker:text-emerald-500 dark:text-zinc-200">{th ? "เข้าสู่ระบบด้วย Magic Link" : "Sign in with Magic Link"}</summary>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{th ? "ใช้เมื่อลืมรหัสผ่านหรือไม่สะดวกพิมพ์ ไม่จำเป็นต้องใช้ทุกครั้ง" : "Use this as a backup when you do not want to enter your password."}</p>
            <form action={sendMagicLink} className="mt-3 grid gap-3">
              <input name="email" type="email" autoComplete="email" required placeholder={m.email} className="cute-input h-11 px-4 outline-none"/>
              <button className="cute-secondary h-11 rounded-xl text-sm font-semibold">{m.magic}</button>
            </form>
          </details>

          <form action={loginWithGoogle} className="mt-3"><button className="cute-secondary h-12 w-full rounded-2xl font-semibold">{m.google}</button></form>
        </section>
      </div>
    </main>
  );
}
