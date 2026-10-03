"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination } from "@/lib/auth-flow";
import { isEmailSendRateLimit } from "@/lib/auth-errors";

const PENDING_USERNAME_COOKIE = "keptpoint_pending_username";

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

function readCredentials(formData: FormData) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=missing-credentials");
  if (password.length < 8) redirect("/login?error=password-short");
  return { email, password };
}

const passwordlessSignUpSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().toLowerCase().email(),
});

async function appOrigin() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host");
  const host = forwarded ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "https://keptpoint.vercel.app";
}

async function profileForUser(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("username,locale,theme").eq("id", userId).maybeSingle();
  if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
    await setPreferenceCookies(profile.locale, profile.theme);
  }
  return profile;
}

async function rememberPendingUsername(username: string) {
  const store = await cookies();
  store.set(PENDING_USERNAME_COOKIE, username, {
    path: "/",
    maxAge: 60 * 60,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(readCredentials(formData));
  if (error || !data.user) redirect("/login?error=invalid-credentials");
  const profile = await profileForUser(data.user.id);
  redirect(postAuthDestination(profile?.username));
}

export async function signUpWithEmail(formData: FormData) {
  const parsed = passwordlessSignUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
  });
  if (!parsed.success) redirect("/signup?error=invalid-fields");

  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/confirm?next=/home`,
      data: {
        desired_username: parsed.data.username,
      },
    },
  });

  if (error) {
    if (isEmailSendRateLimit(error)) redirect("/signup?error=email-rate-limit");
    redirect("/signup?error=signup-failed");
  }

  await rememberPendingUsername(parsed.data.username);
  redirect("/signup/check-email");
}

export async function resendConfirmation(formData: FormData) {
  const email = readEmail(formData);
  if (!email) redirect("/signup/check-email?error=email-required");
  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/confirm?next=/home`,
    },
  });
  if (error) {
    if (isEmailSendRateLimit(error)) redirect("/signup/check-email?error=email-rate-limit");
    redirect("/signup/check-email?error=resend-failed");
  }
  redirect("/signup/check-email?status=resent");
}

export async function sendMagicLink(formData: FormData) {
  const email = readEmail(formData);
  if (!email) redirect("/login?error=email-required");
  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm?next=/home`,
    },
  });
  if (error) {
    if (isEmailSendRateLimit(error)) redirect("/login?error=email-rate-limit");
    redirect("/login?error=magic-link-failed");
  }
  redirect("/login?status=magic-sent");
}

export async function loginWithGoogle() {
  const origin = await appOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=/home` },
  });
  if (error || !data.url) redirect("/login?error=google-unavailable");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed-out");
}
