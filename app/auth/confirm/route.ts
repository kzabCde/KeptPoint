import type { EmailOtpType, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination, safeNextPath } from "@/lib/auth-flow";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function desiredUsername(user: User | null) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const candidate = typeof metadata?.desired_username === "string" ? metadata.desired_username.trim().toLowerCase() : "";
  return USERNAME_RE.test(candidate) ? candidate : "";
}

function desiredLocale(user: User | null) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  return isLocale(metadata?.locale) ? metadata.locale : null;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = safeNextPath(request.nextUrl.searchParams.get("next"), "/home");
  const supabase = await createClient();

  let user: User | null = null;
  let error: Error | null = null;

  if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
    user = result.data.user;
  } else if (code) {
    const flowId = request.nextUrl.searchParams.get("sb_flow_id");
    const result = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    error = result.error;
    user = result.data.user;
  } else {
    return NextResponse.redirect(new URL("/login?error=confirm-link-invalid", request.url));
  }

  if (error || !user) {
    return NextResponse.redirect(new URL("/login?error=confirm-link-expired", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,locale,theme")
    .eq("id", user.id)
    .maybeSingle();

  let username = profile?.username ?? null;
  const pendingUsername = desiredUsername(user);
  const signupLocale = desiredLocale(user);
  let locale = profile && isLocale(profile.locale) ? profile.locale : null;
  if (!username && signupLocale) locale = signupLocale;

  if (!username && pendingUsername) {
    const { data: saved, error: saveError } = await supabase
      .from("profiles")
      .update({
        username: pendingUsername,
        display_name: profile?.display_name || pendingUsername,
        ...(signupLocale ? { locale: signupLocale } : {}),
        password_set: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("username")
      .maybeSingle();

    if (!saveError && saved?.username) {
      username = saved.username;
    } else if (saveError?.code === "23505") {
      const target = new URL("/onboarding?error=username-taken&confirmed=1", request.url);
      target.searchParams.set("confirmed", "1");
      const response = NextResponse.redirect(target);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  if (locale && profile && isTheme(profile.theme)) {
    await setPreferenceCookies(locale, profile.theme);
  }

  if (type === "recovery") {
    const response = NextResponse.redirect(new URL(requestedNext, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const destination = postAuthDestination({ username }, requestedNext);
  const target = new URL(destination, request.url);
  if (destination === "/onboarding") target.searchParams.set("confirmed", "1");

  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
