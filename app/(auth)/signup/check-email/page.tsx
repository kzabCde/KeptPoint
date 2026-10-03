import Link from "next/link";
import { MailCheck } from "lucide-react";
import { resendConfirmation } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Check your email" };

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const locale=await getLocale();
  const {status,error}=await searchParams;
  const th=locale==="th";

  return <main className="mx-auto flex min-h-dvh max-w-md items-center px-5 py-10"><div className="w-full"><Brand/><div className="mt-8 rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"><MailCheck className="size-10 text-emerald-600 dark:text-emerald-400"/><h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{th?"ตรวจสอบอีเมลของคุณ":"Check your email"}</h1><p className="mt-3 text-sm leading-6 text-zinc-500">{th?"เราได้ส่ง Magic Link แล้ว กดลิงก์ในอีเมลเพื่อยืนยันตัวตนและเข้าสู่ระบบ ระบบจะใช้ Username ที่คุณเลือกสร้างโปรไฟล์ให้อัตโนมัติ":"We sent a magic link. Open it to verify your identity and sign in. KeptPoint will use the username you chose to finish your profile automatically."}</p>{status==="resent"&&<p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{th?"ส่ง Magic Link อีกครั้งแล้ว":"Magic link resent."}</p>}{error&&<p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:bg-red-950/30 dark:text-red-200">{error==="email-rate-limit"?(th?"ส่งอีเมลบ่อยเกินขีดจำกัดของระบบ กรุณารอสักครู่ก่อนส่งซ้ำ":"Email sending is temporarily rate-limited. Wait a little before resending."):(th?"ส่ง Magic Link ซ้ำไม่สำเร็จ กรุณาลองใหม่ภายหลัง":"Could not resend the magic link. Try again later.")}</p>}<form action={resendConfirmation} className="mt-6 grid gap-3"><input name="email" type="email" required placeholder={th?"อีเมลที่ใช้สมัคร":"Signup email"} className="h-12 rounded-2xl border border-zinc-200 bg-transparent px-4 outline-none focus:border-emerald-500 dark:border-zinc-800"/><button className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{th?"ส่ง Magic Link อีกครั้ง":"Resend magic link"}</button></form><Link href="/login" className="mt-4 flex h-12 items-center justify-center rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{th?"กลับไปเข้าสู่ระบบ":"Back to sign in"}</Link></div></div></main>;
}
