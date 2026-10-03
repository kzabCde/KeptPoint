import { BottomNav } from "@/components/bottom-nav";
import { getLocale } from "@/lib/preferences";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <div className="mx-auto min-h-dvh max-w-xl border-x border-zinc-200/70 bg-zinc-50/90 pb-28 dark:border-zinc-900 dark:bg-[#091310]/95">
      {children}
      <BottomNav locale={locale} />
    </div>
  );
}
