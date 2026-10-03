import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto min-h-dvh max-w-xl border-x border-zinc-200/70 bg-zinc-50 pb-28 dark:border-zinc-900 dark:bg-zinc-950">
      {children}
      <BottomNav />
    </div>
  );
}
