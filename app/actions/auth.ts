"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";
import { postAuthDestination } from "@/lib/auth-flow";

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

const signUpSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
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

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(readCredentials(formData));
  if (error || !data.user) redirect("/login?error=invalid-credentials");
  const profile = await profileForUser(data.user.id);
  redirect(postAuthDestination(profile?.username));
}

export async function signUpWithEmail(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) redirect("/signup?error=invalid-fields");
  if (parsed.data.password !== parsed.data.confirmPassword) redirect("/signup?error=password-mismatch");

  const origin = await appOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/onboarding`,
      data: {
        full_name: parsed.data.displayName,
        desired_username: parsed.data.username,
      },
    },
  });

  if (error) redirect("/signup?error=signup-failed");

  if (data.session && data.user) {
    await profileForUser(data.user.id);
    redirect("/onboarding?created=1");
  }

  redirect("/signup/check-email");
}

export async function resendConfirmation(formData: FormData) {
  const email = readEmail(formData);
  if (!email) redirect("/signup/check-email?error=email-required");
  const origin = await appOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/onboarding` },
  });
  if (error) redirect("/signup/check-email?error=resend-failed");
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
  if (error) redirect("/login?error=magic-link-failed");
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
