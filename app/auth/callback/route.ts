import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("username,password_set,locale,theme")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
        await setPreferenceCookies(profile.locale, profile.theme);
      }

      const destination = postAuthDestination(
        { username: profile?.username, passwordSet: profile?.password_set },
        requestedNext,
      );
      const response = NextResponse.redirect(new URL(destination, request.url));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", request.url));
}
