export type LedgerKind =
  | "earn"
  | "bonus"
  | "redeem"
  | "transfer"
  | "adjustment"
  | "refund"
  | "reversal"
  | "expiration";

export interface LedgerEntry {
  amount: number;
  kind: LedgerKind;
}

export function sumLedger(entries: readonly LedgerEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

export function assertPositiveWholeAmount(amount: number): void {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new RangeError("amount must be a positive safe integer");
  }
}

export function assertCanDebit(balance: number, amount: number): void {
  assertPositiveWholeAmount(amount);
  if (!Number.isSafeInteger(balance) || balance < 0) {
    throw new RangeError("balance must be a non-negative safe integer");
  }
  if (amount > balance) {
    throw new RangeError("insufficient balance");
  }
}

export function nextBalance(balance: number, delta: number): number {
  if (!Number.isSafeInteger(balance) || !Number.isSafeInteger(delta)) {
    throw new RangeError("balance and delta must be safe integers");
  }
  const next = balance + delta;
  if (next < 0) throw new RangeError("balance cannot become negative");
  return next;
}

export function stampThresholdReached(current: number, issued: number, required: number): boolean {
  for (const value of [current, issued, required]) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError("stamp values must be non-negative safe integers");
  }
  if (issued === 0 || required === 0) return false;
  return current < required && current + issued >= required;
}
