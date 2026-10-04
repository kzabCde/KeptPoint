import test from "node:test";
import assert from "node:assert/strict";
import { postAuthDestination, safeNextPath } from "../lib/auth-flow.ts";
import { isEmailSendRateLimit } from "../lib/auth-errors.ts";

test("missing username goes to onboarding",()=>assert.equal(postAuthDestination({ username:null, passwordSet:false },"/home"),"/onboarding"));
test("verified profile without password goes to set-password",()=>assert.equal(postAuthDestination({ username:"kept_user", passwordSet:false },"/home"),"/set-password"));
test("complete accounts respect a safe app next path",()=>assert.equal(postAuthDestination({ username:"kept_user", passwordSet:true },"/wallet"),"/wallet"));
test("unsafe external next paths fall back to home",()=>assert.equal(safeNextPath("//evil.example"),"/home"));
test("auth callback routes cannot be used as next",()=>assert.equal(safeNextPath("/auth/confirm"),"/home"));

test("Supabase email limit is classified from error code",()=>assert.equal(isEmailSendRateLimit({code:"over_email_send_rate_limit"}),true));
test("HTTP 429 auth errors are classified as email rate limits",()=>assert.equal(isEmailSendRateLimit({status:429}),true));
test("rate-limit server messages are classified",()=>assert.equal(isEmailSendRateLimit({message:"Email rate limit exceeded"}),true));
test("unrelated auth errors are not email rate limits",()=>assert.equal(isEmailSendRateLimit({code:"invalid_credentials",status:400}),false));
