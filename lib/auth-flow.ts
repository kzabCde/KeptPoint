export function safeNextPath(value: string | null | undefined, fallback = "/home") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth")) return fallback;
  return value;
}

type AuthLandingSearchParams = Record<string, string | string[] | undefined>;

export function canonicalAuthOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.hostname.toLowerCase() === "keptpoint.vercel.app") {
      return "https://pumppoint.vercel.app";
    }
    return url.origin;
  } catch {
    return "https://pumppoint.vercel.app";
  }
}

export function authCompletionPathFromLanding(params: AuthLandingSearchParams) {
  const first = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const hasAuthPayload = Boolean(
    first("code") || first("token_hash") || first("error") || first("error_description"),
  );
  if (!hasAuthPayload) return null;

  const target = new URLSearchParams();
  for (const key of ["code", "token_hash", "type", "sb_flow_id", "error", "error_description"]) {
    const value = first(key);
    if (value) target.set(key, value);
  }
  target.set("next", "/home");
  return `/auth/complete?${target.toString()}`;
}

export type AccountSetupState = {
  username: string | null | undefined;
};

export function postAuthDestination(
  state: AccountSetupState,
  requested?: string | null,
) {
  if (!state.username) return "/onboarding";
  return safeNextPath(requested, "/home");
}
