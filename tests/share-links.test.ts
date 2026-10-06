import test from "node:test";
import assert from "node:assert/strict";
import { legacyReferralInvitePath, normalizeQrToken, normalizeReferralCode, qrEntryPath, referralInvitePath } from "../lib/share-links.ts";

const token = "a".repeat(64);
const storeA = "11111111-1111-4111-8111-111111111111";
const storeB = "22222222-2222-4222-8222-222222222222";

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

test("referral links are scoped by store id", () => {
  assert.equal(normalizeReferralCode(" ab12cd34 "), "AB12CD34");
  assert.equal(referralInvitePath(storeA, "coffee-club", "ab12cd34"), `/ref/${storeA}/coffee-club/AB12CD34`);
  assert.equal(referralInvitePath(storeB, "coffee-club", "ab12cd34"), `/ref/${storeB}/coffee-club/AB12CD34`);
  assert.notEqual(referralInvitePath(storeA, "coffee-club", "AB12CD34"), referralInvitePath(storeB, "coffee-club", "AB12CD34"));
});

test("legacy referral paths remain available for already-shared links", () => {
  assert.equal(legacyReferralInvitePath("coffee-club", "ab12cd34"), "/ref/coffee-club/AB12CD34");
});

test("invalid referral parameters are rejected", () => {
  assert.equal(normalizeReferralCode("bad code"), null);
  assert.throws(() => referralInvitePath("not-a-uuid", "coffee-club", "AB12CD34"));
  assert.throws(() => referralInvitePath(storeA, "Bad Slug", "AB12CD34"));
});
