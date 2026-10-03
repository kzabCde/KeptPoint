export function safeNextPath(value: string | null | undefined, fallback = "/home") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth")) return fallback;
  return value;
}

export function postAuthDestination(username: string | null | undefined, requested?: string | null) {
  if (!username) return "/onboarding";
  return safeNextPath(requested, "/home");
}
