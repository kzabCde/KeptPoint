import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/app/actions/security";
import { Brand } from "@/components/brand";
import { PasswordFields } from "@/components/password-fields";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Reset password" };

const errorText = {
  "invalid-password": { th: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรและทั้งสองช่องต้องตรงกัน", en: "Password must be at least 8 characters and both fields must match." },
  "password-update-failed": { th: "ตั้งรหัสผ่านใหม่ไม่สำเร็จ ลิงก์อาจหมดอายุ กรุณาขอลิงก์ใหม่", en: "Could not update the password. The recovery link may have expired; request a new one." },
  "profile-update-failed": { th: "รหัสผ่านถูกเปลี่ยนแล้ว แต่บันทึกสถานะบัญชีไม่สำเร็จ กรุณาลองเข้าสู่ระบบ", en: "The password changed, but account state could not be saved. Try signing in." },
} as const;

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errorText }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/forgot-password?status=session-required");

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand />
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="grid size-14 place-items-center rounded-[20px] bg-lavender-soft text-violet-700 dark:text-violet-200"><KeyRound className="size-7"/></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{th ? "ตั้งรหัสผ่านใหม่" : "Choose a new password"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "ลิงก์กู้คืนได้รับการยืนยันแล้ว ตั้งรหัสผ่านใหม่เพื่อกลับเข้า KeptPoint" : "Your recovery link is verified. Set a new password to get back into KeptPoint."}</p>
          <div className="mt-5 flex gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200"><ShieldCheck className="mt-0.5 size-4 shrink-0"/><p>{th ? "หลังบันทึก คุณจะเข้าสู่ระบบด้วยรหัสผ่านใหม่นี้ได้ทันที" : "After saving, you can sign in immediately with your new password."}</p></div>
          {error && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorText[error][locale]}</p>}
          <form action={resetPassword} className="mt-6 grid gap-5">
            <PasswordFields locale={locale}/>
            <button className="cute-primary h-12 rounded-2xl font-semibold">{th ? "บันทึกรหัสผ่านใหม่" : "Save new password"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
