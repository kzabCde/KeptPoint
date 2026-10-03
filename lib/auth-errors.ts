export type AuthErrorLike = {
  code?: string;
  status?: number;
  message?: string;
} | null | undefined;

export function isEmailSendRateLimit(error: AuthErrorLike) {
  if (!error) return false;
  return (
    error.code === "over_email_send_rate_limit" ||
    error.status === 429 ||
    /email rate limit exceeded/i.test(error.message ?? "")
  );
}
