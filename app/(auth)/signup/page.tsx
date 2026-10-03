import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { signUpWithEmail } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Create account" };

const errors = {
  "invalid-fields": { th: "กรุณากรอกข้อมูลให้ครบ Username ใช้ a-z, 0-9 และ _ จำนวน 3–30 ตัว", en: "Check all fields. Username must use a-z, 0-9 or _ and be 3–30 characters." },
  "password-mismatch": { th: "รหัสผ่านทั้งสองช่องไม่ตรงกัน", en: "Passwords do not match." },
  "signup-failed": { th: "สร้างบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง หรือเข้าสู่ระบบหากเคยสมัครแล้ว", en: "Could not create the account. Try again, or sign in if you already registered." },
} as const;

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errors }> }) {
  const locale = await getLocale();
  const { error } = await searchParams;
  const th = locale === "th";
  return (
    <main className="mx-auto min-h-dvh max-w-md overflow-x-hidden px-5 py-8">
      <Link href="/login" className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>
      <div className="mt-7"><Brand/><h1 className="mt-8 text-4xl font-semibold tracking-[-0.05em]">{th?"สร้างบัญชี KeptPoint":"Create your KeptPoint account"}</h1><p className="mt-2 text-sm leading-6 text-zinc-500">{th?"สร้างโปรไฟล์ครั้งเดียว แล้วใช้บัญชีเดียวได้ทั้งสะสมและออกแต้ม":"Create one profile, then use the same account to collect and issue rewards."}</p></div>
      {error&&errors[error]&&<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">{errors[error][locale]}</div>}
      <form action={signUpWithEmail} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm font-medium">{th?"ชื่อที่แสดง":"Display name"}<input name="displayName" required minLength={2} maxLength={80} autoComplete="name" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder={th?"ชื่อของคุณ":"Your name"}/></label>
        <label className="grid gap-2 text-sm font-medium">Username<input name="username" required minLength={3} maxLength={30} pattern="[a-z0-9_]{3,30}" autoCapitalize="none" autoCorrect="off" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="kept_user"/><span className="text-xs font-normal text-zinc-500">{th?"ใช้ตัวพิมพ์เล็ก ตัวเลข และ _ เท่านั้น":"Lowercase letters, numbers and _ only."}</span></label>
        <label className="grid gap-2 text-sm font-medium">{th?"อีเมล":"Email"}<input name="email" type="email" required autoComplete="email" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="you@example.com"/></label>
        <label className="grid gap-2 text-sm font-medium">{th?"รหัสผ่าน":"Password"}<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="••••••••"/></label>
        <label className="grid gap-2 text-sm font-medium">{th?"ยืนยันรหัสผ่าน":"Confirm password"}<input name="confirmPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900" placeholder="••••••••"/></label>
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs leading-5 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"><div className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0"/><p>{th?"หลังสมัคร เราจะส่งลิงก์ยืนยันอีเมล เมื่อกดแล้วระบบจะล็อกอินและพาไปขั้นตั้งค่าโปรไฟล์อัตโนมัติ":"After signup, confirm your email. The confirmation link signs you in and continues to profile setup."}</p></div></div>
        <button className="h-12 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{th?"สร้างบัญชี":"Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">{th?"มีบัญชีแล้ว?":"Already have an account?"} <Link href="/login" className="font-semibold text-emerald-700 dark:text-emerald-300">{th?"เข้าสู่ระบบ":"Sign in"}</Link></p>
    </main>
  );
}
