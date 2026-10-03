import test from "node:test";
import assert from "node:assert/strict";
import { postAuthDestination, safeNextPath } from "../lib/auth-flow.ts";
import { isEmailSendRateLimit } from "../lib/auth-errors.ts";

test("incomplete profiles always go to onboarding",()=>assert.equal(postAuthDestination(null,"/home"),"/onboarding"));
test("complete profiles respect safe app next path",()=>assert.equal(postAuthDestination("kept_user","/wallet"),"/wallet"));
test("unsafe external next paths fall back to home",()=>assert.equal(safeNextPath("//evil.example"),"/home"));
test("auth callback routes cannot be used as next",()=>assert.equal(safeNextPath("/auth/confirm"),"/home"));

test("Supabase email limit is classified from error code",()=>assert.equal(isEmailSendRateLimit({code:"over_email_send_rate_limit"}),true));
test("HTTP 429 auth errors are classified as email rate limits",()=>assert.equal(isEmailSendRateLimit({status:429}),true));
test("unrelated auth errors are not email rate limits",()=>assert.equal(isEmailSendRateLimit({code:"invalid_credentials",status:400}),false));
