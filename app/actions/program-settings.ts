"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const slugSchema = z.string().min(1).max(100);

async function requireProgramManager(programId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("authentication required");
  const { data: program } = await supabase.from("programs").select("owner_id,program_type,currency_name").eq("id", programId).maybeSingle();
  if (!program) throw new Error("program not found");
  if (program.owner_id !== auth.user.id) {
    const { data: staff } = await supabase.from("program_staff").select("role").eq("program_id", programId).eq("user_id", auth.user.id).maybeSingle();
    if (!staff || !["admin", "manager"].includes(staff.role)) throw new Error("insufficient permissions");
  }
  return { supabase, program };
}

export async function saveLoyaltySettings(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    currencyName: z.string().trim().min(1).max(30).optional(),
    allowPointTransfer: z.boolean(),
    pointRedemptionEnabled: z.boolean(),
    pointTierEnabled: z.boolean(),
    stampCardId: z.string().uuid().optional(),
    stampCardName: z.string().trim().min(1).max(80).optional(),
    requiredStamps: z.coerce.number().int().min(2).max(100).optional(),
    maxStampsPerTransaction: z.coerce.number().int().min(1).max(100).optional(),
    stampRewardName: z.string().trim().min(1).max(100).optional(),
    stampRewardDescription: z.string().trim().max(500).optional(),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    currencyName: formData.get("currencyName") || undefined,
    allowPointTransfer: formData.get("allowPointTransfer") === "on",
    pointRedemptionEnabled: formData.get("pointRedemptionEnabled") === "on",
    pointTierEnabled: formData.get("pointTierEnabled") === "on",
    stampCardId: formData.get("stampCardId") || undefined,
    stampCardName: formData.get("stampCardName") || undefined,
    requiredStamps: formData.get("requiredStamps") || undefined,
    maxStampsPerTransaction: formData.get("maxStampsPerTransaction") || undefined,
    stampRewardName: formData.get("stampRewardName") || undefined,
    stampRewardDescription: formData.get("stampRewardDescription") || undefined,
  });

  const { supabase, program } = await requireProgramManager(input.programId);
  const pointsCapable = program.program_type === "points" || program.program_type === "hybrid";
  const stampsCapable = program.program_type === "stamps" || program.program_type === "hybrid";

  const { error: programError } = await supabase.from("programs").update({
    currency_name: input.currencyName ?? program.currency_name,
    allow_point_transfer: pointsCapable && input.allowPointTransfer,
    point_redemption_enabled: pointsCapable && input.pointRedemptionEnabled,
    point_tier_enabled: pointsCapable && input.pointTierEnabled,
    updated_at: new Date().toISOString(),
  }).eq("id", input.programId);
  if (programError) throw new Error(programError.message);

  if (stampsCapable && input.stampCardId && input.stampCardName && input.requiredStamps && input.maxStampsPerTransaction && input.stampRewardName) {
    const { error: stampError } = await supabase.from("stamp_cards").update({
      name: input.stampCardName,
      required_stamps: input.requiredStamps,
      max_stamps_per_transaction: input.maxStampsPerTransaction,
      updated_at: new Date().toISOString(),
    }).eq("id", input.stampCardId).eq("program_id", input.programId);
    if (stampError) throw new Error(stampError.message);

    const { data: existingReward, error: existingRewardError } = await supabase.from("rewards")
      .select("id")
      .eq("program_id", input.programId)
      .eq("stamp_card_id", input.stampCardId)
      .maybeSingle();
    if (existingRewardError) throw new Error(existingRewardError.message);

    if (existingReward) {
      const { error } = await supabase.from("rewards").update({
        name: input.stampRewardName,
        description: input.stampRewardDescription ?? "",
        reward_type: "stamps",
        points_required: null,
        stamps_required: input.requiredStamps,
        stamp_card_id: input.stampCardId,
        active: true,
        updated_at: new Date().toISOString(),
      }).eq("id", existingReward.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("rewards").insert({
        program_id: input.programId,
        name: input.stampRewardName,
        description: input.stampRewardDescription ?? "",
        reward_type: "stamps",
        points_required: null,
        stamps_required: input.requiredStamps,
        stamp_card_id: input.stampCardId,
      });
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath(`/programs/${input.slug}`);
  revalidatePath(`/programs/${input.slug}/growth`);
  revalidatePath(`/programs/${input.slug}/manage/growth`);
  revalidatePath(`/programs/${input.slug}/manage/loyalty`);
  revalidatePath(`/programs/${input.slug}/manage/rewards`);
}

export async function saveProgramSettings(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500),
    visibility: z.enum(["public", "private", "invite_only"]),
    terms: z.string().trim().max(3000),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    visibility: formData.get("visibility"),
    terms: formData.get("terms") ?? "",
  });

  const { supabase } = await requireProgramManager(input.programId);
  const { error } = await supabase.from("programs").update({
    name: input.name,
    description: input.description,
    visibility: input.visibility,
    terms: input.terms,
    updated_at: new Date().toISOString(),
  }).eq("id", input.programId);
  if (error) throw new Error(error.message);

  revalidatePath(`/programs/${input.slug}`);
  revalidatePath(`/programs/${input.slug}/manage`);
  revalidatePath(`/programs/${input.slug}/manage/settings`);
}
