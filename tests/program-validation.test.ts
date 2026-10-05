import test from "node:test";
import assert from "node:assert/strict";
import { issueAmountSchema } from "../lib/validation/program.ts";

const baseIssue = {
  programId: "11111111-1111-4111-8111-111111111111",
  memberId: "22222222-2222-4222-8222-222222222222",
  amount: 10,
  idempotencyKey: "33333333-3333-4333-8333-333333333333",
};

test("issue mutations require a valid idempotency key", () => {
  assert.equal(issueAmountSchema.safeParse(baseIssue).success, true);
  assert.equal(issueAmountSchema.safeParse({ ...baseIssue, idempotencyKey: "" }).success, false);
});

test("issue mutations reject non-positive amounts", () => {
  assert.equal(issueAmountSchema.safeParse({ ...baseIssue, amount: 0 }).success, false);
  assert.equal(issueAmountSchema.safeParse({ ...baseIssue, amount: -1 }).success, false);
});
