export type RewardState = "locked" | "almost" | "available" | "out-of-stock";

export function getRewardState({
  rewardType,
  pointsRequired,
  stampsRequired,
  stock,
  balance,
  stamps,
}: {
  rewardType: string;
  pointsRequired: number | null;
  stampsRequired: number | null;
  stock: number | null;
  balance: number;
  stamps: number;
}): RewardState {
  if (stock !== null && stock <= 0) return "out-of-stock";
  if (rewardType === "manual") return "available";

  const current = rewardType === "stamps" ? stamps : balance;
  const required = rewardType === "stamps" ? Number(stampsRequired ?? 0) : Number(pointsRequired ?? 0);
  if (required <= 0) return "available";
  if (current >= required) return "available";
  if (current / required >= 0.75) return "almost";
  return "locked";
}

export function rewardProgress(current: number, required: number | null) {
  if (!required || required <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((current / required) * 100)));
}
