"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, isTheme, setPreferenceCookies } from "@/lib/preferences";

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

async function appOrigin() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host");
  const host = forwarded ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "https://keptpoint.vercel.app";
}

async function restorePreferences(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("locale,theme").eq("id", userId).maybeSingle();
  if (profile && isLocale(profile.locale) && isTheme(profile.theme)) {
    await setPreferenceCookies(profile.locale, profile.theme);
  }
}

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(readCredentials(formData));
  if (error) redirect("/login?error=invalid-credentials");
  if (data.user) await restorePreferences(data.user.id);
  redirect("/home");
}

export async function signUpWithEmail(formData: FormData) {
  const credentials = readCredentials(formData);
  const origin = await appOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    const duplicate = /already|registered|duplicate|exists/i.test(error.message);
    redirect(`/login?error=${duplicate ? "account-exists" : "signup-failed"}`);
  }

  if (data.session && data.user) {
    await restorePreferences(data.user.id);
    redirect("/home?auth=created");
  }

  redirect("/login?status=check-email");
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
      emailRedirectTo: `${origin}/auth/confirm`,
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
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error || !data.url) redirect("/login?error=google-unavailable");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?status=signed-out");
}
