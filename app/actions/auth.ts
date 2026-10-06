"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getLocale, isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { canonicalAuthOrigin, postAuthDestination, safeNextPath } from "@/lib/auth-flow";
import { isEmailSendRateLimit } from "@/lib/auth-errors";

function readEmail(formData: FormData) {
  return String(formData.get("email") ?? "").trim().toLowerCase();
}

function readNext(formData: FormData) {
  return safeNextPath(String(formData.get("next") ?? ""), "/home");
}

function authPath(path: string, key: "error" | "status", value: string, next = "/home") {
  const query = new URLSearchParams({ [key]: value });
  if (next !== "/home") query.set("next", next);
  return `${path}?${query.toString()}`;
}

function readCredentials(formData: FormData, next: string) {
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(authPath("/login", "error", "missing-credentials", next));
  if (password.length < 8) redirect(authPath("/login", "error", "password-short", next));
  return { email, password };
}

const signUpSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
}).superRefine((value, ctx) => {
  if (value.password !== value.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "password mismatch" });
  }
});

async function appOrigin() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host");
  const host = forwarded ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return canonicalAuthOrigin(host ? `${proto}://${host}` : "https://pumppoint.vercel.app");
}

async function profileForUser(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username,locale,theme")
    .eq("id", userId)
    .maybeSingle();

  if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
    await setPreferenceCookies(profile.locale, profile.theme);
  }
  return profile;
}

export async function loginWithEmail(formData: FormData) {
  const next = readNext(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(readCredentials(formData, next));
  if (error || !data.user) redirect(authPath("/login", "error", "invalid-credentials", next));

  const profile = await profileForUser(data.user.id);
  redirect(postAuthDestination({ username: profile?.username }, next));
}

export async function signUpWithEmail(formData: FormData) {
  const next = readNext(formData);
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) redirect(authPath("/signup", "error", "invalid-fields", next));

  const origin = await appOrigin();
  const locale = await getLocale();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/complete?next=${encodeURIComponent(next)}`,
      data: { desired_username: parsed.data.username, locale, post_auth_next: next },
    },
  });

  if (error) {
    if (isEmailSendRateLimit(error)) redirect(authPath("/signup", "error", "email-rate-limit", next));
    redirect(authPath("/signup", "error", "signup-failed", next));
  }

  const query = new URLSearchParams();
  if (next !== "/home") query.set("next", next);
  redirect(`/signup/check-email${query.size ? `?${query.toString()}` : ""}`);
}

export async function resendConfirmation(formData: FormData) {
  const next = readNext(formData);
  const email = readEmail(formData);
  if (!email) redirect(authPath("/signup/check-email", "error", "email-required", next));

  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/auth/complete?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (isEmailSendRateLimit(error)) redirect(authPath("/signup/check-email", "error", "email-rate-limit", next));
    redirect(authPath("/signup/check-email", "error", "resend-failed", next));
  }
  redirect(authPath("/signup/check-email", "status", "resent", next));
}

export async function requestPasswordReset(formData: FormData) {
  const email = readEmail(formData);
  if (!email) redirect("/forgot-password?error=email-required");

  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/complete?next=/reset-password`,
  });

  if (error && isEmailSendRateLimit(error)) {
    redirect("/forgot-password?error=email-rate-limit");
  }
  if (error) redirect("/forgot-password?error=request-failed");

  redirect("/forgot-password?status=sent");
}

export async function loginWithGoogle(formData: FormData) {
  const next = readNext(formData);
  const origin = await appOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(authPath("/login", "error", "google-unavailable", next));
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed-out");
}
