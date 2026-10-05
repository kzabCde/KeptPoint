import test from "node:test";
import assert from "node:assert/strict";
import { authCompletionPathFromLanding, canonicalAuthOrigin, postAuthDestination, safeNextPath } from "../lib/auth-flow.ts";
import { isEmailSendRateLimit } from "../lib/auth-errors.ts";

test("missing username goes to onboarding",()=>assert.equal(postAuthDestination({ username:null },"/home"),"/onboarding"));
test("verified accounts with username go directly home",()=>assert.equal(postAuthDestination({ username:"kept_user" },"/home"),"/home"));
test("verified accounts respect a safe app next path",()=>assert.equal(postAuthDestination({ username:"kept_user" },"/wallet"),"/wallet"));
test("unsafe external next paths fall back to home",()=>assert.equal(safeNextPath("//evil.example"),"/home"));
test("auth callback routes cannot be used as next",()=>assert.equal(safeNextPath("/auth/confirm"),"/home"));
test("auth completion routes cannot redirect back into auth",()=>assert.equal(safeNextPath("/auth/complete?next=/wallet"),"/home"));
test("landing auth code is recovered through the completion flow",()=>assert.equal(
  authCompletionPathFromLanding({ code:"confirm-code" }),
  "/auth/complete?code=confirm-code&next=%2Fhome",
));
test("landing auth recovery preserves only known auth parameters",()=>assert.equal(
  authCompletionPathFromLanding({ token_hash:"abc", type:"signup", sb_flow_id:"flow", next:"//evil.example" }),
  "/auth/complete?token_hash=abc&type=signup&sb_flow_id=flow&next=%2Fhome",
));
test("normal landing requests do not enter auth completion",()=>assert.equal(authCompletionPathFromLanding({}),null));
test("legacy KeptPoint auth origin is canonicalized to PumpPoint",()=>assert.equal(
  canonicalAuthOrigin("https://keptpoint.vercel.app"),
  "https://pumppoint.vercel.app",
));
test("preview auth origins keep their own host",()=>assert.equal(
  canonicalAuthOrigin("https://feat-pumppoint.example.vercel.app/some-path"),
  "https://feat-pumppoint.example.vercel.app",
));

test("Supabase email limit is classified from error code",()=>assert.equal(isEmailSendRateLimit({code:"over_email_send_rate_limit"}),true));
test("HTTP 429 auth errors are classified as email rate limits",()=>assert.equal(isEmailSendRateLimit({status:429}),true));
test("rate-limit server messages are classified",()=>assert.equal(isEmailSendRateLimit({message:"Email rate limit exceeded"}),true));
test("unrelated auth errors are not email rate limits",()=>assert.equal(isEmailSendRateLimit({code:"invalid_credentials",status:400}),false));
