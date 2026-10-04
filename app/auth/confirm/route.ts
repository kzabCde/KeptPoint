import type { EmailOtpType, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination, safeNextPath } from "@/lib/auth-flow";

const PENDING_USERNAME_COOKIE = "keptpoint_pending_username";
const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function desiredUsername(user: User | null, request: NextRequest) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const fromMetadata = typeof metadata?.desired_username === "string" ? metadata.desired_username.trim().toLowerCase() : "";
  const fromCookie = request.cookies.get(PENDING_USERNAME_COOKIE)?.value?.trim().toLowerCase() ?? "";
  const candidate = fromMetadata || fromCookie;
  return USERNAME_RE.test(candidate) ? candidate : "";
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
    .select("display_name,username,password_set,locale,theme")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
    await setPreferenceCookies(profile.locale, profile.theme);
  }

  let username = profile?.username ?? null;
  const passwordSet = profile?.password_set ?? false;
  const pendingUsername = desiredUsername(user, request);

  if (!username && pendingUsername) {
    const { data: saved, error: saveError } = await supabase
      .from("profiles")
      .update({
        username: pendingUsername,
        display_name: profile?.display_name || pendingUsername,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("username")
      .maybeSingle();

    if (!saveError && saved?.username) {
      username = saved.username;
    } else if (saveError?.code === "23505") {
      const target = new URL("/onboarding?error=username-taken&confirmed=1", request.url);
      const response = NextResponse.redirect(target);
      response.cookies.delete(PENDING_USERNAME_COOKIE);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  const destination = postAuthDestination(
    { username, passwordSet },
    requestedNext,
  );
  const target = new URL(destination, request.url);
  if (destination === "/onboarding") target.searchParams.set("confirmed", "1");
  if (destination === "/set-password" && type !== "recovery") target.searchParams.set("welcome", "1");

  const response = NextResponse.redirect(target);
  response.cookies.delete(PENDING_USERNAME_COOKIE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
