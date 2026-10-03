"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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
  const { data, error } = await supabase.from("programs").insert({
    owner_id: user.id,
    name: input.name,
    slug: input.slug,
    description: input.description,
    program_type: input.programType,
    visibility: input.visibility,
    currency_name: input.currencyName,
  }).select("id,slug").single();
  if (error) throw new Error(error.message);
  if ((input.programType === "stamps" || input.programType === "hybrid") && input.requiredStamps) {
    const { error: stampError } = await supabase.from("stamp_cards").insert({
      program_id: data.id,
      required_stamps: input.requiredStamps,
      name: "Main Stamp Card",
    });
    if (stampError) throw new Error(stampError.message);
  }
  redirect(`/programs/${data.slug}/manage`);
}

export async function joinProgram(programId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("join_program", { p_program_id: programId });
  if (error) throw new Error(error.message);
  revalidatePath("/wallet");
}

export async function issuePoints(input: { programId: string; memberId: string; amount: number; note?: string }) {
  const valid = issueAmountSchema.parse({ ...input, idempotencyKey: randomUUID() });
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

export async function issueStamp(input: { programId: string; memberId: string; amount?: number; note?: string }) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("issue_stamp", {
    p_program_id: input.programId,
    p_member_id: input.memberId,
    p_amount: input.amount ?? 1,
    p_note: input.note ?? undefined,
    p_idempotency_key: randomUUID(),
  });
  if (error) throw new Error(error.message);
  return data;
}

const rewardSchema = z.object({
  programId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  rewardType: z.enum(["points", "stamps", "free", "manual"]),
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
  const { error } = await supabase.from("rewards").insert({
    program_id: input.programId,
    name: input.name,
    description: input.description,
    reward_type: input.rewardType,
    points_required: input.rewardType === "points" ? input.cost ?? null : null,
    stamps_required: input.rewardType === "stamps" ? input.cost ?? null : null,
    stock: input.stock ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}`);
  revalidatePath(`/programs/${input.slug}/manage/rewards`);
}

export async function redeemReward(rewardId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId, p_idempotency_key: randomUUID() });
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

export async function createQrSession(programId: string, action: "join" | "earn_points" | "earn_stamp", amount?: number) {
  const { supabase } = await requireUser();
  const payload = amount ? { amount } : {};
  const { data, error } = await supabase.rpc("create_qr_session", {
    p_program_id: programId,
    p_action: action,
    p_payload: payload,
    p_ttl_seconds: 90,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function acceptQrToken(formData: FormData) {
  const token = z.string().trim().min(16).max(256).parse(formData.get("token"));
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("accept_qr_session", { p_token: token });
  if (error) throw new Error(error.message);
  redirect("/activity?qr=success");
}
