"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsRead() {
  const supabase=await createClient();
  const { data:auth }=await supabase.auth.getUser();
  if(!auth.user) return;
  const { error }=await supabase.from("notifications").update({read_at:new Date().toISOString()}).eq("user_id",auth.user.id).is("read_at",null);
  if(error) throw new Error(error.message);
  revalidatePath("/notifications");
  revalidatePath("/home");
}
