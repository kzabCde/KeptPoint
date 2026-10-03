import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Create account" };

const errors = {
  "invalid-fields": { th: "กรุณาตรวจ Username และอีเมลอีกครั้ง Username ใช้ตัวอักษร ตัวเลข และ _ จำนวน 3–30 ตัว", en: "Check your username and email. Username must use letters, numbers or _ and be 3–30 characters." },
  "signup-failed": { th: "ยังไม่สามารถส่ง Magic Link ได้ กรุณาลองใหม่อีกครั้ง", en: "Could not send the magic link. Please try again." },
  "email-rate-limit": { th: "ระบบส่งอีเมลถึงขีดจำกัดชั่วคราว กรุณารอสักครู่แล้วลองอีกครั้ง", en: "Email sending is temporarily rate-limited. Wait a little and try again." },
} as const;

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errors }> }) {
  const locale = await getLocale();
  const { error } = await searchParams;
  const th = locale === "th";

  return (
    <main className="mx-auto min-h-dvh max-w-md overflow-x-hidden px-5 py-8">
      <Link href="/login" className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>
      <div className="mt-7">
        <Brand/>
        <h1 className="mt-8 text-4xl font-semibold tracking-[-0.05em]">{th?"สร้างบัญชี KeptPoint":"Create your KeptPoint account"}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{th?"ไม่ต้องตั้งรหัสผ่าน กำหนด Username และอีเมล แล้วเรา จะส่ง Magic Link สำหรับยืนยันและเข้าสู่ระบบให้ทันที":"No password required. Choose a username and enter your email; we’ll send a magic link to verify and sign you in."}</p>
      </div>

      {error&&errors[error]&&<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">{errors[error][locale]}</div>}

      <form action={signUpWithEmail} className="mt-7 grid gap-4" noValidate={false}>
        <label className="grid gap-2 text-sm font-medium">
          Username
          <input name="username" required minLength={3} maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="kept_user"/>
          <span className="text-xs font-normal leading-5 text-zinc-500">{th?"ใช้ตัวอักษร a–z, ตัวเลข และ _ ระบบจะแปลงตัวพิมพ์ใหญ่เป็นตัวพิมพ์เล็กให้อัตโนมัติ":"Use letters, numbers and _. Uppercase letters are normalized to lowercase."}</span>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          {th?"อีเมล":"Email"}
          <input name="email" type="email" required autoComplete="email" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="you@example.com"/>
        </label>

        <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
          <div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p>{th?"Magic Link ใช้ได้ครั้งเดียว เมื่อกดจากอีเมล ระบบจะสร้าง session และพาเข้า KeptPoint โดยไม่ต้องกรอกรหัสผ่าน":"The magic link is single-use. Opening it creates your session and signs you into KeptPoint without a password."}</p></div>
        </div>

        <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950"><Mail className="size-4"/>{th?"ไปต่อด้วย Magic Link":"Continue with Magic Link"}</button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">{th?"มีบัญชีแล้ว?":"Already have an account?"} <Link href="/login" className="font-semibold text-emerald-700 dark:text-emerald-300">{th?"เข้าสู่ระบบ":"Sign in"}</Link></p>
    </main>
  );
}
