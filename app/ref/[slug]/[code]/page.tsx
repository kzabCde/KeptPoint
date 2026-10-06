import Link from "next/link";
import { Gift, LogIn, Share2, UserPlus } from "lucide-react";
import { acceptLegacyReferralInvite } from "@/app/actions/growth";
import { Brand } from "@/components/brand";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { getLocale } from "@/lib/preferences";
import { legacyReferralInvitePath, normalizeReferralCode } from "@/lib/share-links";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Referral invitation" };

const errors: Record<string, { th: string; en: string }> = {
  invalid: { th: "ลิงก์ชวนเพื่อนนี้ไม่ถูกต้อง หมดสิทธิ์ใช้งาน หรือร้านปิด Referral แล้ว", en: "This referral link is invalid, unavailable, or referrals have been disabled." },
  ambiguous: { th: "ลิงก์ Referral รุ่นเก่านี้ไม่สามารถระบุร้านได้อย่างปลอดภัย กรุณาขอลิงก์ใหม่จากผู้แนะนำ", en: "This legacy referral link can no longer identify a store safely. Ask the referrer for a new link." },
  self: { th: "ไม่สามารถใช้ลิงก์ชวนเพื่อนของตัวเองได้", en: "You cannot use your own referral link." },
  "too-late": { th: "บัญชีนี้เริ่มสะสมกับร้านนี้ไปแล้ว จึงใช้ Referral ย้อนหลังไม่ได้", en: "This account has already started earning with this program, so a referral cannot be applied retroactively." },
  "already-claimed": { th: "บัญชีนี้เคยรับ Referral อื่นของร้านนี้แล้ว", en: "This account has already claimed another referral for this program." },
  blocked: { th: "บัญชีนี้ไม่สามารถเข้าร่วมโปรแกรมของร้านได้", en: "This account cannot join this program." },
  disabled: { th: "ร้านปิดการใช้งาน Referral ชั่วคราว", en: "The business has temporarily disabled referrals." },
};

export default async function ReferralInvitePage({ params, searchParams }: { params: Promise<{ slug: string; code: string }>; searchParams: Promise<{ error?: string; status?: string }> }) {
  const [{ slug, code: rawCode }, query, locale, supabase] = await Promise.all([params, searchParams, getLocale(), createClient()]);
  const th = locale === "th";
  const code = normalizeReferralCode(rawCode);
  if (!code) return <main className="auth-canvas min-h-dvh px-5 py-8"><div className="mx-auto w-full max-w-md"><Brand/><section className="cute-card mt-7 p-6"><h1 className="text-2xl font-semibold">{th ? "ลิงก์ Referral ไม่ถูกต้อง" : "Invalid referral link"}</h1></section></div></main>;

  const path = legacyReferralInvitePath(slug, code);
  const { data: auth } = await supabase.auth.getUser();
  const errorMessage = query.error ? errors[query.error]?.[locale] : undefined;
  const pending = query.status === "pending";
  return <main className="auth-canvas min-h-dvh px-5 py-8"><div className="mx-auto w-full max-w-md"><Brand/><section className="cute-card mt-7 p-6 sm:p-7"><span className="grid size-14 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><Share2 className="size-6"/></span><p className="mt-5 text-xs font-bold uppercase tracking-[.14em] text-[#087F6E]">PumpPoint Referral · Legacy</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">{th ? "มีเพื่อนชวนคุณมาเก็บสิทธิ์ด้วยกัน" : "A friend invited you to earn rewards together"}</h1><p className="mt-3 text-sm leading-6 text-zinc-500">{th ? "ลิงก์นี้เป็นรูปแบบเดิม ระบบจะตรวจหาร้านจากโค้ดอย่างปลอดภัยและเปลี่ยนไปใช้ลิงก์ที่ผูก Store ID ให้โดยอัตโนมัติ" : "This is a legacy link. PumpPoint will safely resolve its store and move you to the new store-scoped flow."}</p><div className="mt-5 rounded-2xl bg-zinc-50 p-4 dark:bg-white/5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-zinc-400">Invite code</p><p className="mt-1 font-mono text-xl font-semibold tracking-[.08em]">{code}</p></div>{errorMessage && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</p>}{!auth.user ? <div className="mt-6 grid gap-3"><Link href={`/login?next=${encodeURIComponent(path)}`} className="cute-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><LogIn className="size-4"/>{th ? "เข้าสู่ระบบเพื่อรับคำเชิญ" : "Sign in to accept"}</Link><Link href={`/signup?next=${encodeURIComponent(path)}`} className="cute-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl font-semibold"><UserPlus className="size-4"/>{th ? "สร้างบัญชีใหม่" : "Create account"}</Link></div> : pending ? <Link href="/home" className="cute-primary mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl font-semibold">{th ? "กลับหน้าหลัก" : "Back to home"}</Link> : <form action={acceptLegacyReferralInvite.bind(null, code, slug)} className="mt-6"><PendingSubmitButton pendingLabel={th ? "กำลังตรวจสอบร้าน…" : "Resolving store…"} className="cute-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold"><Gift className="size-4"/>{th ? "ยอมรับคำเชิญ Referral" : "Accept referral invitation"}</PendingSubmitButton></form>}</section></div></main>;
}
