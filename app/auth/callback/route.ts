import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination, safeNextPath } from "@/lib/auth-flow";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext=safeNextPath(request.nextUrl.searchParams.get("next"),"/home");
  if (code) {
    const supabase = await createClient();
    const flowId=request.nextUrl.searchParams.get("sb_flow_id");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("username,locale,theme").eq("id", data.user.id).maybeSingle();
      if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
        await setPreferenceCookies(profile.locale, profile.theme);
      }
      return NextResponse.redirect(new URL(postAuthDestination(profile?.username,requestedNext), request.url));
    }
  }
  return NextResponse.redirect(new URL("/login?error=oauth", request.url));
}
