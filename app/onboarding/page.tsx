import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRoundCheck } from "lucide-react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/preferences";

export const metadata={title:"Set up profile"};

const errors={
  "invalid-profile":{th:"กรุณาตรวจ Username อีกครั้ง",en:"Check your username."},
  "username-taken":{th:"Username นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น",en:"That username is already taken."},
  "save-failed":{th:"บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่",en:"Could not save the profile. Try again."},
  "profile-missing":{th:"ไม่พบโปรไฟล์สมาชิก กรุณาออกจากระบบแล้วลองอีกครั้ง",en:"Member profile was not found. Sign out and try again."},
} as const;

export default async function OnboardingPage({searchParams}:{searchParams:Promise<{error?:keyof typeof errors;confirmed?:string}>}){
  const locale=await getLocale();
  const {error,confirmed}=await searchParams;
  const supabase=await createClient();
  const {data:auth}=await supabase.auth.getUser();
  if(!auth.user) redirect("/login?status=session-required");

  const {data:profile}=await supabase.from("profiles").select("username").eq("id",auth.user.id).maybeSingle();
  if(profile?.username) redirect("/home");

  const metadata=auth.user.user_metadata as Record<string,unknown>;
  const store=await cookies();
  const metadataUsername=typeof metadata.desired_username==="string"?metadata.desired_username:"";
  const cookieUsername=store.get("keptpoint_pending_username")?.value ?? "";
  const desiredUsername=(metadataUsername||cookieUsername).trim().toLowerCase();
  const th=locale==="th";

  return <main className="mx-auto min-h-dvh max-w-md px-5 py-8"><Brand/><div className="mt-8"><div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><UserRoundCheck className="size-7"/></div><h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{th?"เลือก Username":"Choose your username"}</h1><p className="mt-3 text-sm leading-6 text-zinc-500">{th?"คุณเข้าสู่ระบบผ่าน Magic Link แล้ว ขั้นตอนนี้จะแสดงเฉพาะเมื่อ Username ที่เลือกไว้ยังบันทึกไม่ได้หรือถูกใช้แล้ว":"You are already signed in with the magic link. This step only appears when your chosen username could not be saved automatically or is already taken."}</p>{confirmed&&<p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{th?"ยืนยันอีเมลและเข้าสู่ระบบสำเร็จแล้ว":"Email verified and signed in successfully."}</p>}{error&&errors[error]&&<p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{errors[error][locale]}</p>}<div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-xs text-zinc-500">{th?"อีเมล":"Email"}</p><p className="mt-1 break-all text-sm font-medium">{auth.user.email}</p></div><form action={completeOnboarding} className="mt-5 grid gap-4"><label className="grid gap-2 text-sm font-medium">Username<input name="username" defaultValue={desiredUsername} required minLength={3} maxLength={30} autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/><span className="text-xs font-normal text-zinc-500">{th?"ใช้ตัวอักษร ตัวเลข และ _ จำนวน 3–30 ตัว":"Use letters, numbers and _; 3–30 characters."}</span></label><button className="h-12 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950">{th?"บันทึกและเริ่มใช้งาน":"Save and continue"}</button></form></div></main>;
}
