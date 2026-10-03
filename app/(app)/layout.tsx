import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getLocale } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()]);
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <div className="mx-auto min-h-dvh max-w-xl overflow-x-hidden border-x border-zinc-200/70 bg-zinc-50/90 pb-28 dark:border-zinc-900 dark:bg-[#091310]/95">
      {children}
      <BottomNav locale={locale} />
    </div>
  );
}
