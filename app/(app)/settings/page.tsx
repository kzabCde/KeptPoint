import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SettingsPreferences } from "@/components/settings-preferences";
import { getPreferences } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export default async function SettingsPage() {
  const preferences = await getPreferences();
  const m = messages[preferences.locale].settings;
  return (
    <main className="px-5 py-6">
      <Link href="/profile" className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><ArrowLeft className="size-4"/></Link>
      <h1 className="mt-7 text-3xl font-semibold tracking-[-0.04em]">{m.title}</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{m.description}</p>
      <SettingsPreferences initialLocale={preferences.locale} initialTheme={preferences.theme} />
      <div className="mt-4 flex gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"/>
        <p className="leading-6 text-zinc-500">{m.syncNote}</p>
      </div>
    </main>
  );
}
