"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

const uuid = z.string().uuid();
const slugSchema = z.string().min(1).max(100);

export async function saveReferralSettings(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    enabled: z.boolean(),
    referrerBonus: z.coerce.number().int().min(0).max(1_000_000),
    referredBonus: z.coerce.number().int().min(0).max(1_000_000),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    enabled: formData.get("enabled") === "on",
    referrerBonus: formData.get("referrerBonus"),
    referredBonus: formData.get("referredBonus"),
  });
  const { supabase } = await requireUser();
  const { error } = await supabase.from("program_referral_settings").upsert({
    program_id: input.programId,
    enabled: input.enabled,
    referrer_bonus: input.referrerBonus,
    referred_bonus: input.referredBonus,
    updated_at: new Date().toISOString(),
  }, { onConflict: "program_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}/manage/growth`);
  revalidatePath(`/programs/${input.slug}/growth`);
}

export async function generateReferralCode(programId: string, slug: string, _formData?: FormData) {
  const validProgramId = uuid.parse(programId);
  const validSlug = slugSchema.parse(slug);
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("get_or_create_referral_code", { p_program_id: validProgramId });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${validSlug}/growth`);
}

export async function claimReferral(programId: string, slug: string, formData: FormData) {
  const input = z.object({ programId: uuid, slug: slugSchema, code: z.string().trim().min(8).max(16) }).parse({
    programId,
    slug,
    code: formData.get("code"),
  });
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("claim_referral", { p_program_id: input.programId, p_code: input.code.toUpperCase() });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}/growth`);
}

export async function createCoupon(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    code: z.string().trim().min(3).max(32).regex(/^[A-Za-z0-9_-]+$/),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500),
    discountType: z.enum(["perk", "percent", "fixed"]),
    discountValue: z.coerce.number().positive().optional(),
    maxRedemptions: z.coerce.number().int().positive().optional(),
    maxPerUser: z.coerce.number().int().min(1).max(100),
    expiresAt: z.string().optional(),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    discountType: formData.get("discountType"),
    discountValue: formData.get("discountValue") || undefined,
    maxRedemptions: formData.get("maxRedemptions") || undefined,
    maxPerUser: formData.get("maxPerUser") || 1,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (input.discountType !== "perk" && input.discountValue == null) throw new Error("discount value is required");
  if (input.discountType === "percent" && (input.discountValue ?? 0) > 100) throw new Error("percentage cannot exceed 100");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("coupons").insert({
    program_id: input.programId,
    code: input.code.toUpperCase(),
    name: input.name,
    description: input.description,
    discount_type: input.discountType,
    discount_value: input.discountType === "perk" ? null : input.discountValue,
    max_redemptions: input.maxRedemptions ?? null,
    max_per_user: input.maxPerUser,
    expires_at: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}/manage/growth`);
  revalidatePath(`/programs/${input.slug}/growth`);
}

export async function toggleCoupon(couponId: string, slug: string, nextActive: boolean, _formData?: FormData) {
  const validId = uuid.parse(couponId);
  const validSlug = slugSchema.parse(slug);
  const { supabase } = await requireUser();
  const { error } = await supabase.from("coupons").update({ active: nextActive, updated_at: new Date().toISOString() }).eq("id", validId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${validSlug}/manage/growth`);
  revalidatePath(`/programs/${validSlug}/growth`);
}

export async function claimCoupon(couponId: string, slug: string, _formData?: FormData) {
  const validId = uuid.parse(couponId);
  const validSlug = slugSchema.parse(slug);
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("claim_coupon", { p_coupon_id: validId });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${validSlug}/growth`);
}

export async function redeemCoupon(redemptionId: string, slug: string, _formData?: FormData) {
  const validId = uuid.parse(redemptionId);
  const validSlug = slugSchema.parse(slug);
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("redeem_coupon", { p_redemption_id: validId });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${validSlug}/manage/growth`);
  revalidatePath(`/programs/${validSlug}/growth`);
}

export async function createTier(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    name: z.string().trim().min(1).max(50),
    minLifetimeEarned: z.coerce.number().int().min(0),
    benefits: z.string().trim().max(500),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    minLifetimeEarned: formData.get("minLifetimeEarned"),
    benefits: formData.get("benefits") ?? "",
  });
  const benefits = input.benefits.split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 10);
  const { supabase } = await requireUser();
  const { error } = await supabase.from("program_tiers").insert({
    program_id: input.programId,
    name: input.name,
    min_lifetime_earned: input.minLifetimeEarned,
    benefits,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${input.slug}/manage/growth`);
  revalidatePath(`/programs/${input.slug}/growth`);
}

export async function toggleTier(tierId: string, slug: string, nextActive: boolean, _formData?: FormData) {
  const validId = uuid.parse(tierId);
  const validSlug = slugSchema.parse(slug);
  const { supabase } = await requireUser();
  const { error } = await supabase.from("program_tiers").update({ active: nextActive, updated_at: new Date().toISOString() }).eq("id", validId);
  if (error) throw new Error(error.message);
  revalidatePath(`/programs/${validSlug}/manage/growth`);
  revalidatePath(`/programs/${validSlug}/growth`);
}
