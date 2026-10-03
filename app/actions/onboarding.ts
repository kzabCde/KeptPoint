"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
});

export async function completeOnboarding(formData: FormData) {
  const parsed = schema.safeParse({ username: formData.get("username") });
  if (!parsed.success) redirect("/onboarding?error=invalid-profile");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?status=session-required");

  const { data: current } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", auth.user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: current?.display_name || parsed.data.username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") redirect("/onboarding?error=username-taken");
    redirect("/onboarding?error=save-failed");
  }
  if (!data) redirect("/onboarding?error=profile-missing");

  revalidatePath("/home");
  revalidatePath("/profile");
  redirect("/home?onboarding=complete");
}
