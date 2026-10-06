const QR_TOKEN_RE = /^[0-9a-f]{64}$/i;
const REFERRAL_CODE_RE = /^[A-Z0-9]{8,16}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeQrToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (QR_TOKEN_RE.test(value)) return value.toLowerCase();

  try {
    const url = new URL(value, "https://pumppoint.invalid");
    const candidate = url.searchParams.get("token") ?? url.searchParams.get("qr");
    if (candidate && QR_TOKEN_RE.test(candidate.trim())) return candidate.trim().toLowerCase();
  } catch {
    return null;
  }

  return null;
}

export function qrEntryPath(token: string): string {
  const normalized = normalizeQrToken(token);
  if (!normalized) throw new Error("invalid QR token");
  return `/q?token=${encodeURIComponent(normalized)}`;
}

export function normalizeReferralCode(raw: string): string | null {
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_RE.test(code) ? code : null;
}

export function referralInvitePath(programId: string, slug: string, code: string): string {
  const normalizedCode = normalizeReferralCode(code);
  if (!UUID_RE.test(programId) || !SLUG_RE.test(slug) || !normalizedCode) {
    throw new Error("invalid referral link parameters");
  }
  return `/ref/${encodeURIComponent(programId.toLowerCase())}/${encodeURIComponent(slug)}/${encodeURIComponent(normalizedCode)}`;
}

export function legacyReferralInvitePath(slug: string, code: string): string {
  const normalizedCode = normalizeReferralCode(code);
  if (!SLUG_RE.test(slug) || !normalizedCode) throw new Error("invalid referral link parameters");
  return `/ref/${encodeURIComponent(slug)}/${encodeURIComponent(normalizedCode)}`;
}
