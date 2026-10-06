"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/auth-flow";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  next: z.string().optional(),
});

function onboardingPath(error: string, next: string) {
  const query = new URLSearchParams({ error });
  if (next !== "/home") query.set("next", next);
  return `/onboarding?${query.toString()}`;
}

export async function completeOnboarding(formData: FormData) {
  const next = safeNextPath(String(formData.get("next") ?? ""), "/home");
  const parsed = schema.safeParse({ username: formData.get("username"), next });
  if (!parsed.success) redirect(onboardingPath("invalid-profile", next));

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?status=session-required${next !== "/home" ? `&next=${encodeURIComponent(next)}` : ""}`);

  const { data: current } = await supabase
    .from("profiles")
    .select("display_name,password_set")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: current?.display_name || parsed.data.username,
      password_set: current?.password_set || auth.user.app_metadata?.provider === "email",
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") redirect(onboardingPath("username-taken", next));
    redirect(onboardingPath("save-failed", next));
  }
  if (!data) redirect(onboardingPath("profile-missing", next));

  revalidatePath("/home");
  revalidatePath("/profile");
  redirect(next === "/home" ? "/home?onboarding=complete" : next);
}
