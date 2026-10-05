import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination, safeNextPath } from "@/lib/auth-flow";

const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

function desiredUsername(user: User | null) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const candidate = typeof metadata?.desired_username === "string"
    ? metadata.desired_username.trim().toLowerCase()
    : "";
  return USERNAME_RE.test(candidate) ? candidate : "";
}

export async function GET(request: NextRequest) {
  const requestedNext = safeNextPath(request.nextUrl.searchParams.get("next"), "/home");
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();

  if (authError || !auth.user) {
    const destination = requestedNext === "/reset-password"
      ? "/forgot-password?error=recovery-link-invalid"
      : "/login?error=confirm-link-expired";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (requestedNext === "/reset-password") {
    const response = NextResponse.redirect(new URL("/reset-password", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,locale,theme")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
    await setPreferenceCookies(profile.locale, profile.theme);
  }

  let username = profile?.username ?? null;
  const pendingUsername = desiredUsername(auth.user);

  if (!username && pendingUsername) {
    const { data: saved, error: saveError } = await supabase
      .from("profiles")
      .update({
        username: pendingUsername,
        display_name: profile?.display_name || pendingUsername,
        password_set: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id)
      .select("username")
      .maybeSingle();

    if (!saveError && saved?.username) {
      username = saved.username;
    } else if (saveError?.code === "23505") {
      const response = NextResponse.redirect(new URL("/onboarding?error=username-taken&confirmed=1", request.url));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  const destination = postAuthDestination({ username }, requestedNext);
  const target = new URL(destination, request.url);
  if (destination === "/onboarding") target.searchParams.set("confirmed", "1");

  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
