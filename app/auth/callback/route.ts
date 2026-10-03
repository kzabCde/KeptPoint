import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("locale,theme").eq("id", data.user.id).maybeSingle();
      if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
        await setPreferenceCookies(profile.locale, profile.theme);
      }
      return NextResponse.redirect(new URL("/home", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
}
