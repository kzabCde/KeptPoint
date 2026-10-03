"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { setPreferenceCookies } from "@/lib/preferences";

const schema = z.object({
  locale: z.enum(["th", "en"]),
  theme: z.enum(["system", "light", "dark"]),
});

export async function savePreferences(input: { locale: "th" | "en"; theme: "system" | "light" | "dark" }) {
  const value = schema.parse(input);
  await setPreferenceCookies(value.locale, value.theme);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user) {
    const { error } = await supabase
      .from("profiles")
      .update({ locale: value.locale, theme: value.theme, updated_at: new Date().toISOString() })
      .eq("id", auth.user.id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
