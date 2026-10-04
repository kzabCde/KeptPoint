export function safeNextPath(value: string | null | undefined, fallback = "/home") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/auth")) return fallback;
  return value;
}

export type AccountSetupState = {
  username: string | null | undefined;
  passwordSet: boolean | null | undefined;
};

export function postAuthDestination(
  state: AccountSetupState,
  requested?: string | null,
) {
  if (!state.username) return "/onboarding";
  if (!state.passwordSet) return "/set-password";
  return safeNextPath(requested, "/home");
}
