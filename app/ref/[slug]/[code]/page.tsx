import Link from "next/link";
import { Gift, LogIn, Share2, UserPlus } from "lucide-react";
import { acceptReferralInvite } from "@/app/actions/growth";
import { Brand } from "@/components/brand";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getLocale } from "@/lib/preferences";
import { normalizeReferralCode, referralInvitePath } from "@/lib/share-links";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Referral invitation" };

const errors: Record<string, { th: string; en: string }> = {
  invalid: { th: "ลิงก์ชวนเพื่อนนี้ไม่ถูกต้อง หมดสิทธิ์ใช้งาน หรือร้านปิด Referral แล้ว", en: "This referral link is invalid, unavailable, or referrals have been disabled." },
  self: { th: "ไม่สามารถใช้ลิงก์ชวนเพื่อนของตัวเองได้", en: "You cannot use your own referral link." },
  "too-late": { th: "บัญชีนี้เริ่มสะสมกับร้านนี้ไปแล้ว จึงใช้ Referral ย้อนหลังไม่ได้", en: "This account has already started earning with this program, so a referral cannot be applied retroactively." },
  "already-claimed": { th: "บัญชีนี้เคยรับ Referral อื่นของร้านนี้แล้ว", en: "This account has already claimed another referral for this program." },
  blocked: { th: "บัญชีนี้ไม่สามารถเข้าร่วมโปรแกรมของร้านได้", en: "This account cannot join this program." },
  disabled: { th: "ร้านปิดการใช้งาน Referral ชั่วคราว", en: "The business has temporarily disabled referrals." },
};

export default async function ReferralInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; code: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}) {
  const [{ slug, code: rawCode }, query, locale, supabase] = await Promise.all([
    params,
    searchParams,
    getLocale(),
    createClient(),
  ]);
  const th = locale === "th";
  const code = normalizeReferralCode(rawCode);

  if (!code) {
    return <main className="auth-canvas min-h-dvh px-5 py-8"><div className="mx-auto w-full max-w-md"><Brand/><section className="cute-card mt-7 p-6"><h1 className="text-2xl font-semibold">{th ? "ลิงก์ Referral ไม่ถูกต้อง" : "Invalid referral link"}</h1><p className="mt-3 text-sm leading-6 text-zinc-500">{th ? "ตรวจสอบลิงก์ที่ได้รับแล้วลองอีกครั้ง" : "Check the link you received and try again."}</p></section></div></main>;
  }

  const path = referralInvitePath(slug, code);
  const { data: auth } = await supabase.auth.getUser();
  const errorMessage = query.error ? errors[query.error]?.[locale] : undefined;
  const pending = query.status === "pending";
  const loginHref = `/login?next=${encodeURIComponent(path)}`;
  const signupHref = `/signup?next=${encodeURIComponent(path)}`;

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand/>
        <section className="cute-card mt-7 p-6 sm:p-7">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-6"/></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]">PumpPoint Referral</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "มีเพื่อนชวนคุณมาเก็บสิทธิ์ด้วยกัน" : "A friend invited you to earn rewards together"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">{th ? "เข้าสู่ระบบหรือสร้างบัญชี แล้วกดยอมรับคำเชิญ ระบบจะพาคุณเข้าร่วมโปรแกรมและผูก Referral ให้อัตโนมัติ" : "Sign in or create an account, then accept the invitation. PumpPoint will join the program and attach the referral automatically."}</p>

          <div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-zinc-400">Invite code</p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-[.08em]">{code}</p>
          </div>

          {errorMessage && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</p>}
          {pending && <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-semibold">{th ? "รับคำเชิญแล้ว · รอร้านอนุมัติ" : "Invitation accepted · waiting for approval"}</p><p className="mt-1 text-xs opacity-80">{th ? "Referral ถูกบันทึกไว้แล้ว เมื่อร้านอนุมัติและคุณสะสมครั้งแรก โบนัสจะทำงานตามเงื่อนไขของร้าน" : "Your referral is saved. After approval and your first qualifying earn, the configured bonus can be awarded."}</p></div>}

          {!auth.user ? (
            <div className="mt-6 grid gap-3">
              <Link href={loginHref} className="cute-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><LogIn className="size-4"/>{th ? "เข้าสู่ระบบเพื่อรับคำเชิญ" : "Sign in to accept"}</Link>
              <Link href={signupHref} className="cute-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><UserPlus className="size-4"/>{th ? "สร้างบัญชีใหม่" : "Create account"}</Link>
            </div>
          ) : pending ? (
            <Link href="/home" className="cute-primary mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl font-semibold">{th ? "กลับหน้าหลัก" : "Back to home"}</Link>
          ) : (
            <form action={acceptReferralInvite.bind(null, code, slug)} className="mt-6">
              <PendingSubmitButton pendingLabel={th ? "กำลังรับคำเชิญ…" : "Accepting…"} className="cute-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold"><Gift className="size-4"/>{th ? "ยอมรับคำเชิญ Referral" : "Accept referral invitation"}</PendingSubmitButton>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
