import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProgramManageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug }=await params;
  const supabase=await createClient();
  const { data:auth }=await supabase.auth.getUser();
  if(!auth.user) redirect("/login");
  const { data:program }=await supabase.from("programs").select("id,owner_id").eq("slug",slug).maybeSingle();
  if(!program) redirect("/home");
  if(program.owner_id!==auth.user.id){
    const { data:staff }=await supabase.from("program_staff").select("role").eq("program_id",program.id).eq("user_id",auth.user.id).maybeSingle();
    if(!staff) redirect("/programs/"+slug);
  }
  return children;
}
