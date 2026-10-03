import { loginWithEmail, loginWithGoogle, sendMagicLink, signUpWithEmail } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Sign in" };

const errorText: Record<string, { th: string; en: string }> = {
  "missing-credentials": { th: "กรุณากรอกอีเมลและรหัสผ่าน", en: "Enter your email and password." },
  "password-short": { th: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร", en: "Password must be at least 8 characters." },
  "invalid-credentials": { th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่ได้ยืนยันอีเมล", en: "Invalid email/password, or the account is not confirmed yet." },
  "account-exists": { th: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบหรือใช้ Magic Link", en: "An account already exists for this email. Sign in or use a magic link." },
  "signup-failed": { th: "สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่", en: "Account creation failed. Please try again." },
  "email-required": { th: "กรุณากรอกอีเมล", en: "Enter your email." },
  "magic-link-failed": { th: "ส่ง Magic Link ไม่สำเร็จ หรืออีเมลนี้ยังไม่มีบัญชี", en: "Could not send a magic link, or this email has no account." },
  "google-unavailable": { th: "Google Sign-in ยังไม่พร้อมใช้งาน", en: "Google sign-in is not available yet." },
  "confirm-link-invalid": { th: "ลิงก์ยืนยันไม่ถูกต้อง", en: "The confirmation link is invalid." },
  "confirm-link-expired": { th: "ลิงก์ยืนยันหมดอายุหรือถูกใช้แล้ว กรุณาขอลิงก์ใหม่", en: "The confirmation link expired or was already used. Request a new one." },
};

const statusText: Record<string, { th: string; en: string }> = {
  "check-email": { th: "สร้างบัญชีแล้ว กรุณาเปิดอีเมลและกดลิงก์ยืนยันก่อนเข้าสู่ระบบ", en: "Account created. Check your email and confirm it before signing in." },
  "magic-sent": { th: "ส่ง Magic Link แล้ว กรุณาตรวจสอบอีเมล", en: "Magic link sent. Check your email." },
  "signed-out": { th: "ออกจากระบบแล้ว", en: "You are signed out." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; status?: string }> }) {
  const locale = await getLocale();
  const m = messages[locale].login;
  const { error, status } = await searchParams;
  const errorMessage = error ? errorText[error]?.[locale] : undefined;
  const statusMessage = status ? statusText[status]?.[locale] : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center overflow-x-hidden px-5 py-10">
      <div className="w-full min-w-0">
        <Brand />
        <h1 className="mt-10 text-4xl font-semibold tracking-[-0.05em]">{m.title}</h1>
        <p className="mt-2 text-zinc-500">{m.tagline}</p>

        {errorMessage && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">{errorMessage}</div>}
        {statusMessage && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">{statusMessage}</div>}

        <form className="mt-8 grid gap-3">
          <input name="email" type="email" autoComplete="email" required placeholder={m.email} className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
          <input name="password" type="password" autoComplete="current-password" required minLength={8} placeholder={m.password} className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
          <button formAction={loginWithEmail} className="h-12 rounded-2xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-400 dark:text-emerald-950">{m.signIn}</button>
          <button formAction={signUpWithEmail} className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.createAccount}</button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"/><span>OR</span><span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800"/></div>

        <form action={sendMagicLink} className="grid gap-3">
          <input name="email" type="email" autoComplete="email" required placeholder={m.email} className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
          <button className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.magic}</button>
        </form>
        <form action={loginWithGoogle} className="mt-3">
          <button className="h-12 w-full rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.google}</button>
        </form>
      </div>
    </main>
  );
}
