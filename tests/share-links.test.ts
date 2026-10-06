import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQrToken, normalizeReferralCode, qrEntryPath, referralInvitePath } from "../lib/share-links.ts";

const token = "a".repeat(64);

test("QR token is normalized from a raw token", () => {
  assert.equal(normalizeQrToken(token.toUpperCase()), token);
});

test("QR token is extracted from PumpPoint entry and scan URLs", () => {
  assert.equal(normalizeQrToken(`https://pumppoint.vercel.app/q?token=${token}`), token);
  assert.equal(normalizeQrToken(`/scan?token=${token}`), token);
});

test("invalid QR payloads are rejected", () => {
  assert.equal(normalizeQrToken("not-a-real-token"), null);
  assert.equal(normalizeQrToken("https://example.com/q?token=short"), null);
});

test("QR entry path carries the real token", () => {
  assert.equal(qrEntryPath(token), `/q?token=${token}`);
});

test("referral codes are normalized and links are canonical", () => {
  assert.equal(normalizeReferralCode(" ab12cd34 "), "AB12CD34");
  assert.equal(referralInvitePath("coffee-club", "ab12cd34"), "/ref/coffee-club/AB12CD34");
});

test("invalid referral parameters are rejected", () => {
  assert.equal(normalizeReferralCode("bad code"), null);
  assert.throws(() => referralInvitePath("Bad Slug", "AB12CD34"));
});
