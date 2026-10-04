import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,password_set")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.username) redirect("/onboarding");
  if (!profile.password_set) redirect("/set-password");

  return (
    <div className="app-shell mx-auto min-h-dvh max-w-xl border-x border-emerald-950/5 pb-28 dark:border-white/5">
      {children}
      <BottomNav locale={locale} />
    </div>
  );
}
