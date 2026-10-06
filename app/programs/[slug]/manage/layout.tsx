import { redirect } from "next/navigation";
import { MerchantShell } from "@/components/merchant-shell";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";
import { mergeBusinessWorkspaces } from "@/lib/workspaces";

export default async function ProgramManageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const [{ slug }, locale, supabase] = await Promise.all([params, getLocale(), createClient()]);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const [{ data: program }, { data: ownedPrograms }, { data: staffRows }] = await Promise.all([
    supabase.from("programs").select("id,owner_id,name,slug").eq("slug", slug).maybeSingle(),
    supabase.from("programs").select("id,name,slug").eq("owner_id", auth.user.id).eq("status", "active"),
    supabase.from("program_staff").select("role,programs(id,name,slug)").eq("user_id", auth.user.id),
  ]);
  if (!program) redirect("/home");

  const businesses = mergeBusinessWorkspaces(ownedPrograms ?? [], staffRows ?? []);
  const currentWorkspace = businesses.find((business) => business.id === program.id);
  const role = program.owner_id === auth.user.id ? "owner" : currentWorkspace?.role;
  if (!role) redirect(`/programs/${slug}`);

  return <MerchantShell slug={slug} programName={program.name} locale={locale} businesses={businesses} role={role}>{children}</MerchantShell>;
}
