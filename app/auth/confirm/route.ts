import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("locale,theme").eq("id", data.user.id).maybeSingle();
      if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
        await setPreferenceCookies(profile.locale, profile.theme);
      }
      return NextResponse.redirect(new URL("/home", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=confirm", url.origin));
}
