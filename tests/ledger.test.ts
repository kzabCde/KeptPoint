import assert from "node:assert/strict";
import test from "node:test";
import { assertCanDebit, nextBalance, stampThresholdReached, sumLedger } from "../lib/domain/ledger.ts";

test("ledger balance is the sum of immutable entries", () => {
  assert.equal(sumLedger([{ amount: 100, kind: "earn" }, { amount: 20, kind: "bonus" }, { amount: -50, kind: "redeem" }]), 70);
});

test("a debit cannot exceed current balance", () => {
  assert.throws(() => assertCanDebit(40, 50), /insufficient balance/);
  assert.doesNotThrow(() => assertCanDebit(50, 50));
});

test("balance can never become negative", () => {
  assert.equal(nextBalance(100, -40), 60);
  assert.throws(() => nextBalance(10, -11), /cannot become negative/);
});

test("stamp completion only triggers when crossing threshold", () => {
  assert.equal(stampThresholdReached(9, 1, 10), true);
  assert.equal(stampThresholdReached(10, 1, 10), false);
  assert.equal(stampThresholdReached(3, 1, 10), false);
});
