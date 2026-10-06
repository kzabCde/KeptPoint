"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizeQrToken } from "@/lib/share-links";
import { createProgramSchema, issueAmountSchema } from "@/lib/validation/program";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

export async function createProgram(formData: FormData) {
  const input = createProgramSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    programType: formData.get("programType"),
    visibility: formData.get("visibility"),
    currencyName: formData.get("currencyName") ?? "Points",
    requiredStamps: formData.get("requiredStamps") || undefined,
  });
  const { supabase, user } = await requireUser();
  const pointsCapable = input.programType === "points" || input.programType === "hybrid";
  const { data, error } = await supabase.from("programs").insert({
    owner_id: user.id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    program_type: input.programType,
    visibility: input.visibility,
    currency_name: input.currencyName,
    point_redemption_enabled: pointsCapable,
    point_tier_enabled: false,
  }).select("id,slug").single();
  if (error) throw new Error(error.message);
  if ((input.programType === "stamps" || input.programType === "hybrid") && input.requiredStamps) {
    const { data: card, error: stampError } = await supabase.from("stamp_cards").insert({
      program_id: data.id,
      required_stamps: input.requiredStamps,
      name: "Main Stamp Card",
    }).select("id").single();
    if (stampError) throw new Error(stampError.message);
    const { error: rewardError } = await supabase.from("rewards").insert({
      program_id: data.id,
      name: "Stamp card reward",
      description: "Complete the stamp card to unlock this perk.",
      reward_type: "stamps",
      stamps_required: input.requiredStamps,
      stamp_card_id: card.id,
    });
    if (rewardError) throw new Error(rewardError.message);
  }
  redirect(`/programs/${data.slug}/manage/loyalty`);
}

export async function joinProgram(programId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("join_program", { p_program_id: programId });
  if (error) throw new Error(error.message);
  revalidatePath("/wallet");
  revalidatePath("/home");
}

export async function issuePoints(input: { programId: string; memberId: string; amount: number; note?: string; idempotencyKey: string }) {
  const valid = issueAmountSchema.parse(input);
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("issue_points", {
    p_program_id: valid.programId,
    p_member_id: valid.memberId,
    p_amount: valid.amount,
    p_note: valid.note ?? undefined,
    p_idempotency_key: valid.idempotencyKey,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function issueStamp(input: { programId: string; memberId: string; amount?: number; note?: string; idempotencyKey: string }) {
  const valid = issueAmountSchema.parse({ ...input, amount: input.amount ?? 1 });
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("issue_stamp", {
    p_program_id: valid.programId,
    p_member_id: valid.memberId,
    p_amount: valid.amount,
    p_note: valid.note ?? undefined,
    p_idempotency_key: valid.idempotencyKey,
  });
  if (error) throw new Error(error.message);
  return data;
}

const rewardSchema = z.object({
  programId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  rewardType: z.enum(["points", "free", "manual"]),
  cost: z.coerce.number().int().positive().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
});

export async function createReward(formData: FormData) {
  const input = rewardSchema.parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    rewardType: formData.get("rewardType"),
    cost: formData.get("cost") || undefined,
    stock: formData.get("stock") || undefined,
  });
  const { supabase } = await requireUser();
  const { data: program, error: programError } = await supabase.from("programs").select("program_type,point_redemption_enabled").eq("id", input.programId).single();
  if (programError) throw new Error(programError.message);
  if (input.rewardType === "points" && (program.program_type === "stamps" || !program.point_redemption_enabled)) {
    throw new Error("point redemption is disabled for this program");
  }
  if (input.rewardType === "points" && input.cost == null) throw new Error("point cost is required");
  const { error } = await supabase.from("rewards").insert({
    program_id: input.programId,
    name: input.name,
    description: input.description,
    reward_type: input.rewardType,
    points_required: input.rewardType === "points" ? input.cost ?? null : null,
    stamps_required: null,
    stamp_card_id: null,
    stock: input.stock ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}`);
  revalidatePath(`/programs/${input.slug}/manage/rewards`);
}

export async function redeemReward(rewardId: string, formData: FormData) {
  const parsedRewardId = z.string().uuid().parse(rewardId);
  const idempotencyKey = z.string().uuid().parse(formData.get("idempotencyKey"));
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: parsedRewardId, p_idempotency_key: idempotencyKey });
  if (error) throw new Error(error.message);
  revalidatePath("/activity");
  void data;
}

export async function completeRedemption(redemptionId: string, slug: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("complete_redemption", { p_redemption_id: redemptionId });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${slug}/manage/redemptions`);
}

export async function cancelRedemption(redemptionId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("cancel_redemption", { p_redemption_id: redemptionId });
  if (error) throw new Error(error.message);
  revalidatePath("/activity");
}

const qrSessionSchema = z.object({
  programId: z.string().uuid(),
  action: z.enum(["join", "earn_points", "earn_stamp"]),
  amount: z.number().int().positive().optional(),
}).superRefine((value, ctx) => {
  if (value.action === "earn_points" && (value.amount == null || value.amount > 1_000_000)) {
    ctx.addIssue({ code: "custom", path: ["amount"], message: "points amount must be between 1 and 1000000" });
  }
  if (value.action === "earn_stamp" && (value.amount == null || value.amount > 100)) {
    ctx.addIssue({ code: "custom", path: ["amount"], message: "stamp amount must be between 1 and 100" });
  }
});

export async function createQrSession(programId: string, action: "join" | "earn_points" | "earn_stamp", amount?: number) {
  const input = qrSessionSchema.parse({ programId, action, amount });
  const { supabase } = await requireUser();
  const payload = input.action === "join" ? {} : { amount: input.amount };
  const { data, error } = await supabase.rpc("create_qr_session", {
    p_program_id: input.programId,
    p_action: input.action,
    p_payload: payload,
    p_ttl_seconds: input.action === "join" ? 3600 : 90,
  });
  if (error) throw new Error(error.message);
  return data;
}

function qrErrorCode(message: string) {
  const value = message.toLowerCase();
  if (value.includes("expired")) return "expired";
  if (value.includes("already used")) return "used";
  if (value.includes("own qr")) return "own";
  if (value.includes("member not active")) return "membership";
  return "invalid";
}

export async function acceptQrToken(formData: FormData) {
  const raw = z.string().trim().min(1).max(512).parse(formData.get("token"));
  const token = normalizeQrToken(raw);
  if (!token) redirect("/scan?qr=invalid");

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("accept_qr_session", { p_token: token });
  if (error) redirect(`/scan?qr=${qrErrorCode(error.message)}`);
  redirect("/activity?qr=success");
}

export async function issuePointsForm(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const amount = Number(formData.get("amount"));
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  await issuePoints({ programId, memberId, amount, idempotencyKey });
  revalidatePath("/programs/" + slug + "/manage/members");
  revalidatePath("/home");
  redirect("/programs/" + slug + "/manage/members?ok=points");
}

export async function issueStampForm(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const amount = Number(formData.get("amount") ?? 1);
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  await issueStamp({ programId, memberId, amount, idempotencyKey });
  revalidatePath("/programs/" + slug + "/manage/members");
  revalidatePath("/home");
  redirect("/programs/" + slug + "/manage/members?ok=stamp");
}
