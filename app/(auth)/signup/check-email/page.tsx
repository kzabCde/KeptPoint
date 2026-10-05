import Link from "next/link";
import { Check, KeyRound, MailCheck, UserRound } from "lucide-react";
import { resendConfirmation } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const locale = await getLocale();
  const { status, error } = await searchParams;
  const th = locale === "th";

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand/>
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="grid size-16 place-items-center rounded-[22px] bg-lavender-soft text-violet-700 dark:text-violet-200"><MailCheck className="size-8"/></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{th ? "เช็กอีเมลของคุณ ✉️" : "Check your email ✉️"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "เราได้ส่งลิงก์ยืนยันการสร้างบัญชีแล้ว กดลิงก์เพียงครั้งเดียวเพื่อยืนยันอีเมลและเข้าสู่ Home" : "We sent an account verification link. Open it once to verify your email and continue to Home."}</p>

          <div className="mt-6 grid gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-mint-soft px-4 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Check className="size-4"/></span><div><p className="text-sm font-semibold">{th ? "1. Username + Email + Password พร้อมแล้ว" : "1. Username + Email + Password ready"}</p><p className="text-xs text-zinc-600 dark:text-zinc-300">{th ? "ข้อมูลล็อกอินถูกกำหนดตั้งแต่ตอนสมัคร" : "Your sign-in credentials were set during signup."}</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-lavender-soft px-4 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-600 text-white"><MailCheck className="size-4"/></span><div><p className="text-sm font-semibold">{th ? "2. กดลิงก์ยืนยันในอีเมล" : "2. Open the verification link"}</p><p className="text-xs text-zinc-600 dark:text-zinc-300">{th ? "ลิงก์นี้ใช้เฉพาะยืนยันการสมัคร" : "This link is only for signup verification."}</p></div></div>
            <div className="flex items-center gap-3 rounded-2xl bg-reward-soft px-4 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-500 text-amber-950"><KeyRound className="size-4"/></span><div><p className="text-sm font-semibold">{th ? "3. ครั้งถัดไปใช้ Email + Password" : "3. Next time use Email + Password"}</p><p className="text-xs text-zinc-600 dark:text-zinc-300">{th ? "ไม่ต้องใช้ Magic Link ในการเข้าสู่ระบบ" : "Magic Link is not used for sign-in."}</p></div></div>
          </div>

          {status === "resent" && <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">{th ? "ส่งลิงก์ยืนยันอีกครั้งแล้ว" : "Verification link resent."}</p>}
          {error && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{error === "email-rate-limit" ? (th ? "ส่งอีเมลบ่อยเกินขีดจำกัด กรุณารอสักครู่ก่อนส่งซ้ำ" : "Email sending is temporarily rate-limited. Wait a little before resending.") : (th ? "ส่งลิงก์ซ้ำไม่สำเร็จ กรุณาลองใหม่ภายหลัง" : "Could not resend the verification link. Try again later.")}</p>}

          <form action={resendConfirmation} className="mt-6 grid gap-3">
            <input name="email" type="email" required placeholder={th ? "อีเมลที่ใช้สมัคร" : "Signup email"} className="cute-input h-12 px-4 outline-none"/>
            <PendingSubmitButton pendingLabel={th ? "กำลังส่ง…" : "Sending…"} className="cute-secondary h-12 rounded-2xl font-semibold">{th ? "ส่งลิงก์ยืนยันอีกครั้ง" : "Resend verification link"}</PendingSubmitButton>
          </form>
          <Link href="/login" className="mt-4 flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"><UserRound className="size-4"/>{th ? "กลับไปหน้าเข้าสู่ระบบ" : "Back to sign in"}</Link>
        </section>
      </div>
    </main>
  );
}
