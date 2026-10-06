import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";
import { mergeBusinessWorkspaces } from "@/lib/workspaces";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [{ data: profile }, unread, { data: ownedPrograms }, { data: staffRows }] = await Promise.all([
    supabase.from("profiles").select("username,display_name").eq("id", data.user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", data.user.id).is("read_at", null),
    supabase.from("programs").select("id,name,slug").eq("owner_id", data.user.id).eq("status", "active"),
    supabase.from("program_staff").select("role,programs(id,name,slug)").eq("user_id", data.user.id),
  ]);

  if (!profile?.username) redirect("/onboarding");

  const displayName = profile.display_name?.trim() || profile.username || data.user.email?.split("@")[0] || "PumpPoint member";
  const businesses = mergeBusinessWorkspaces(ownedPrograms ?? [], staffRows ?? []);

  return (
    <AppShell locale={locale} displayName={displayName} unread={unread.count ?? 0} businesses={businesses}>
      {children}
    </AppShell>
  );
}
