import test from "node:test";
import assert from "node:assert/strict";
import { postAuthDestination, safeNextPath } from "../lib/auth-flow.ts";

test("incomplete profiles always go to onboarding",()=>assert.equal(postAuthDestination(null,"/home"),"/onboarding"));
test("complete profiles respect safe app next path",()=>assert.equal(postAuthDestination("kept_user","/wallet"),"/wallet"));
test("unsafe external next paths fall back to home",()=>assert.equal(safeNextPath("//evil.example"),"/home"));
test("auth callback routes cannot be used as next",()=>assert.equal(safeNextPath("/auth/confirm"),"/home"));
