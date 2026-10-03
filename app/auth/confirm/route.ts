import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const supabase = await createClient();

  let userId: string | undefined;
  let error: Error | null = null;

  if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
    userId = result.data.user?.id;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
    userId = result.data.user?.id;
  } else {
    return NextResponse.redirect(new URL("/login?error=confirm-link-invalid", request.url));
  }

  if (!error && userId) {
    const { data: profile } = await supabase.from("profiles").select("locale,theme").eq("id", userId).maybeSingle();
    if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
      await setPreferenceCookies(profile.locale, profile.theme);
    }
    return NextResponse.redirect(new URL("/home?auth=confirmed", request.url));
  }

  return NextResponse.redirect(new URL("/login?error=confirm-link-expired", request.url));
}
