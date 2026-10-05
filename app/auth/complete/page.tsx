"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "email",
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
]);

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

function asEmailOtpType(value: string | null): EmailOtpType | null {
  return value && EMAIL_OTP_TYPES.has(value as EmailOtpType) ? (value as EmailOtpType) : null;
}

function failureTarget(next: string) {
  return next === "/reset-password"
    ? "/forgot-password?error=recovery-link-invalid"
    : "/login?error=confirm-link-expired";
}

export default function AuthCompletePage() {
  const [message, setMessage] = useState("กำลังยืนยันข้อมูลบัญชี…");

  useEffect(() => {
    let active = true;

    async function completeAuth() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const next = safeNextPath(url.searchParams.get("next"));
      const supabase = createClient();

      const upstreamError =
        url.searchParams.get("error_description") ??
        url.searchParams.get("error") ??
        hash.get("error_description") ??
        hash.get("error");

      if (upstreamError) {
        window.location.replace(failureTarget(next));
        return;
      }

      const tokenHash = url.searchParams.get("token_hash");
      const code = url.searchParams.get("code");
      const type = asEmailOtpType(url.searchParams.get("type") ?? hash.get("type"));
      let authError: Error | null = null;

      if (tokenHash && type) {
        const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        authError = result.error;
      } else if (code) {
        const flowId = url.searchParams.get("sb_flow_id");
        const result = await supabase.auth.exchangeCodeForSession(
          code,
          flowId ? { flowId } : undefined,
        );
        authError = result.error;
      } else {
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const result = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          authError = result.error;
        } else {
          const result = await supabase.auth.getSession();
          authError = result.error;
          if (!result.data.session && !authError) {
            authError = new Error("No auth session was returned by the confirmation link.");
          }
        }
      }

      if (authError) {
        window.location.replace(failureTarget(next));
        return;
      }

      const cleanUrl = new URL("/auth/complete", window.location.origin);
      cleanUrl.searchParams.set("next", next);
      window.history.replaceState(null, "", cleanUrl.toString());

      if (active) setMessage("ยืนยันสำเร็จ กำลังพาเข้าสู่ KeptPoint…");
      window.location.replace(`/auth/finalize?next=${encodeURIComponent(next)}`);
    }

    void completeAuth();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="auth-canvas min-h-dvh px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <Brand />
        <section className="cute-card mt-7 p-6 text-center sm:p-7">
          <div className="mx-auto grid size-16 place-items-center rounded-[22px] bg-mint-soft text-emerald-700 dark:text-emerald-200">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">กำลังยืนยันบัญชี</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{message}</p>
          <LoaderCircle className="mx-auto mt-6 size-6 animate-spin text-emerald-600" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
