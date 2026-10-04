import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AtSign, Check, KeyRound, MailCheck, UserRoundCheck } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata = { title: "Set up profile" };

const errors = {
  "invalid-profile": { th: "กรุณาตรวจ Username อีกครั้ง", en: "Check your username." },
  "username-taken": { th: "Username นี้ถูกใช้แล้ว ลองชื่อใหม่อีกนิดนะ", en: "That username is already taken. Try another one." },
  "save-failed": { th: "บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่", en: "Could not save the profile. Try again." },
  "profile-missing": { th: "ไม่พบโปรไฟล์สมาชิก กรุณาออกจากระบบแล้วลองอีกครั้ง", en: "Member profile was not found. Sign out and try again." },
} as const;

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: keyof typeof errors; confirmed?: string }> }) {
  const locale = await getLocale();
  const { error, confirmed } = await searchParams;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?status=session-required");

  const { data: profile } = await supabase.from("profiles").select("username,password_set").eq("id", auth.user.id).maybeSingle();
  if (profile?.username) redirect(profile.password_set ? "/home" : "/set-password?welcome=1");

  const metadata = auth.user.user_metadata as Record<string, unknown>;
  const store = await cookies();
  const metadataUsername = typeof metadata.desired_username === "string" ? metadata.desired_username : "";
  const cookieUsername = store.get("keptpoint_pending_username")?.value ?? "";
  const desiredUsername = (metadataUsername || cookieUsername).trim().toLowerCase();
  const th = locale === "th";

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand/>
        <section className="cute-card mt-7 p-6 sm:p-7">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-200"><MailCheck className="size-3.5"/><Check className="size-3"/>{th ? "ยืนยันอีเมลแล้ว" : "Email verified"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-reward-soft px-3 py-1.5 text-amber-800 dark:text-amber-200"><KeyRound className="size-3.5"/>{th ? "ต่อไปตั้งรหัสผ่าน" : "Password next"}</span>
          </div>
          <div className="mt-6 grid size-14 place-items-center rounded-[20px] bg-lavender-soft text-violet-700 dark:text-violet-200"><UserRoundCheck className="size-7"/></div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{th ? "เลือก Username ใหม่ ✨" : "Choose a new username ✨"}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{th ? "ขั้นตอนนี้จะแสดงเมื่อชื่อที่เลือกไว้ถูกใช้แล้วหรือระบบยังบันทึกให้ไม่ได้ เลือกชื่อที่เป็นคุณแล้วไปต่อได้เลย" : "You only see this when your original username was unavailable. Pick another one and continue."}</p>

          {confirmed && <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-200">{th ? "ยืนยันอีเมลและเข้าสู่ระบบสำเร็จแล้ว" : "Email verified and signed in successfully."}</p>}
          {error && errors[error] && <p role="alert" className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">{errors[error][locale]}</p>}

          <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-white/5"><p className="text-xs text-zinc-500">{th ? "อีเมล" : "Email"}</p><p className="mt-1 break-all text-sm font-semibold">{auth.user.email}</p></div>
          <form action={completeOnboarding} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">Username<div className="cute-input flex items-center gap-2 px-4"><AtSign className="size-4 text-emerald-600"/><input name="username" defaultValue={desiredUsername} required minLength={3} maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 min-w-0 flex-1 bg-transparent outline-none"/></div><span className="text-xs font-normal text-zinc-500">{th ? "ใช้ a–z, ตัวเลข และ _ จำนวน 3–30 ตัว" : "Use a-z, numbers and _; 3–30 characters."}</span></label>
            <button className="cute-primary h-12 rounded-2xl font-semibold">{th ? "บันทึก Username และไปตั้งรหัสผ่าน" : "Save username & set password"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
