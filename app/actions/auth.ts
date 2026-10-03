"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) throw new Error("Email and password are required");
  return { email, password };
}

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData));
  if (error) throw new Error(error.message);
  redirect("/home");
}

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(credentials(formData));
  if (error) throw new Error(error.message);
  redirect("/home");
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("Email is required");
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/confirm` } });
  if (error) throw new Error(error.message);
  redirect("/login?magic=sent");
}

export async function loginWithGoogle() {
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback` } });
  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}
