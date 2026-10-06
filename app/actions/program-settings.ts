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
  const { data: program } = await supabase.from("programs").select("owner_id").eq("id", programId).maybeSingle();
  if (!program) throw new Error("program not found");
  if (program.owner_id !== auth.user.id) {
    const { data: staff } = await supabase.from("program_staff").select("role").eq("program_id", programId).eq("user_id", auth.user.id).maybeSingle();
    if (!staff || !["admin", "manager"].includes(staff.role)) throw new Error("insufficient permissions");
  }
  return supabase;
}

export async function saveLoyaltySettings(formData: FormData) {
  const input = z.object({
    programId: uuid,
    slug: slugSchema,
    currencyName: z.string().trim().min(1).max(30),
    allowPointTransfer: z.boolean(),
    stampCardId: z.string().uuid().optional(),
    requiredStamps: z.coerce.number().int().min(1).max(100).optional(),
    maxStampsPerTransaction: z.coerce.number().int().min(1).max(100).optional(),
  }).parse({
    programId: formData.get("programId"),
    slug: formData.get("slug"),
    currencyName: formData.get("currencyName"),
    allowPointTransfer: formData.get("allowPointTransfer") === "on",
    stampCardId: formData.get("stampCardId") || undefined,
    requiredStamps: formData.get("requiredStamps") || undefined,
    maxStampsPerTransaction: formData.get("maxStampsPerTransaction") || undefined,
  });

  const supabase = await requireProgramManager(input.programId);
  const { error: programError } = await supabase.from("programs").update({
    currency_name: input.currencyName,
    allow_point_transfer: input.allowPointTransfer,
    updated_at: new Date().toISOString(),
  }).eq("id", input.programId);
  if (programError) throw new Error(programError.message);

  if (input.stampCardId && input.requiredStamps && input.maxStampsPerTransaction) {
    const { error: stampError } = await supabase.from("stamp_cards").update({
      required_stamps: input.requiredStamps,
      max_stamps_per_transaction: input.maxStampsPerTransaction,
      updated_at: new Date().toISOString(),
    }).eq("id", input.stampCardId).eq("program_id", input.programId);
    if (stampError) throw new Error(stampError.message);
  }

  revalidatePath(`/programs/${input.slug}`);
  revalidatePath(`/programs/${input.slug}/manage/loyalty`);
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

  const supabase = await requireProgramManager(input.programId);
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
