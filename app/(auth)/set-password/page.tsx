import { redirect } from "next/navigation";
import { Check, KeyRound, MailCheck, UserRoundCheck } from "lucide-react";
import { setInitialPassword } from "@/app/actions/security";
import { Brand } from "@/components/brand";
import { PasswordFields } from "@/components/password-fields";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Set password" };

const errorText = {
  "invalid-password": { th: "กรุณาตรวจรหัสผ่านอีกครั้ง รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษรและทั้งสองช่องต้องตรงกัน", en: "Check your password. It must be at least 8 characters and both fields must match." },
  "password-update-failed": { th: "ยังตั้งรหัสผ่านไม่ได้ กรุณาลองใหม่อีกครั้ง", en: "We could not set your password. Please try again." },
  "profile-update-failed": { th: "ตั้งรหัสผ่านแล้วแต่บันทึกสถานะบัญชีไม่สำเร็จ กรุณาลองใหม่", en: "The password was updated but account setup could not be completed. Please try again." },
} as const;

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errorText; welcome?: string }> }) {
  const locale = await getLocale();
  const th = locale === "th";
  const { error, welcome } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?status=session-required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,password_set")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!profile?.username) redirect("/onboarding");
  if (profile.password_set) redirect("/home");

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand />
        <section className="cute-card mt-7 overflow-hidden p-6 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 dark:bg-emerald-950/50"><MailCheck className="size-3.5"/><Check className="size-3"/>{th?"ยืนยันอีเมลแล้ว":"Email verified"}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 dark:bg-emerald-950/50"><UserRoundCheck className="size-3.5"/><Check className="size-3"/>{th?"มี Username แล้ว":"Username ready"}</span>
          </div>

          <div className="mt-6 grid size-14 place-items-center rounded-[20px] bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-950/40 dark:text-amber-300">
            <KeyRound className="size-7"/>
          </div>
          <p className="mt-5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{th?"ขั้นตอนสุดท้าย":"Final step"}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{th?"ตั้งรหัสผ่านของคุณ":"Create your password"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th?"ต่อจากนี้คุณจะเข้าสู่ระบบด้วยอีเมลและรหัสผ่านได้ทันที โดยไม่ต้องรอ Magic Link ทุกครั้ง":"After this, sign in with email and password anytime without waiting for another magic link."}</p>

          {(welcome || !error) && <div className="mt-5 rounded-2xl bg-lavender-soft px-4 py-3 text-sm leading-6 text-violet-800 dark:text-violet-200">{th?"บัญชีได้รับการยืนยันแล้ว เหลือเพียงสร้างรหัสผ่านสำหรับการเข้าใช้งานครั้งถัดไป":"Your account is verified. Create a password for future sign-ins."}</div>}
          {error && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errorText[error][locale]}</p>}

          <form action={setInitialPassword} className="mt-6 grid gap-5">
            <PasswordFields locale={locale}/>
            <button className="cute-primary h-12 w-full rounded-2xl font-semibold">{th?"บันทึกรหัสผ่านและเริ่มใช้งาน":"Save password & start"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
