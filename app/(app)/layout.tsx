import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const [{ data: profile }, unread] = await Promise.all([
    supabase.from("profiles").select("username,display_name").eq("id", data.user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", data.user.id).is("read_at", null),
  ]);

  if (!profile?.username) redirect("/onboarding");

  const displayName = profile.display_name?.trim() || profile.username || data.user.email?.split("@")[0] || "PumpPoint member";

  return (
    <AppShell locale={locale} displayName={displayName} unread={unread.count ?? 0}>
      {children}
    </AppShell>
  );
}
