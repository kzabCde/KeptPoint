import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPreferences, isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination, safeNextPath } from "@/lib/auth-flow";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = safeNextPath(request.nextUrl.searchParams.get("next"), "/home");

  if (code) {
    const supabase = await createClient();
    const flowId = request.nextUrl.searchParams.get("sb_flow_id");
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error && data.user) {
      const visitorPreferences = await getPreferences();
      const { data: profile } = await supabase
        .from("profiles")
        .select("username,locale,theme")
        .eq("id", data.user.id)
        .maybeSingle();

      const accountAge = Date.now() - new Date(data.user.created_at).getTime();
      const isNewAccount = Number.isFinite(accountAge) && accountAge >= 0 && accountAge < 5 * 60 * 1000;
      const locale = isNewAccount ? visitorPreferences.locale : profile?.locale;

      if (isNewAccount && profile && isLocale(locale) && locale !== profile.locale) {
        await supabase
          .from("profiles")
          .update({ locale, updated_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }

      if (profile && isLocale(locale) && isTheme(profile.theme)) {
        await setPreferenceCookies(locale, profile.theme);
      }

      const destination = postAuthDestination(
        { username: profile?.username },
        requestedNext,
      );
      const response = NextResponse.redirect(new URL(destination, request.url));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", request.url));
}
