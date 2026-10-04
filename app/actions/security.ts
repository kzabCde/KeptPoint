"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z.object({
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "password mismatch" });
  }
});

async function updatePassword(formData: FormData, errorPath: string) {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) redirect(`${errorPath}?error=invalid-password`);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?status=session-required");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect(`${errorPath}?error=password-update-failed`);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ password_set: true, updated_at: new Date().toISOString() })
    .eq("id", auth.user.id);

  if (profileError) redirect(`${errorPath}?error=profile-update-failed`);

  revalidatePath("/", "layout");
  return auth.user;
}

export async function setInitialPassword(formData: FormData) {
  await updatePassword(formData, "/set-password");
  redirect("/home?status=password-set");
}

export async function resetPassword(formData: FormData) {
  await updatePassword(formData, "/reset-password");
  redirect("/home?status=password-reset");
}

export async function changePassword(formData: FormData) {
  await updatePassword(formData, "/settings/security");
  redirect("/settings/security?status=password-changed");
}
