"use client";

import { useState, useTransition } from "react";
import { Check, Languages, Laptop, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { savePreferences } from "@/app/actions/preferences";
import { messages, type Locale } from "@/lib/i18n";
import type { ThemePreference } from "@/lib/preferences";
import { cn } from "@/lib/utils";

function applyTheme(theme: ThemePreference) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function SettingsPreferences({ initialLocale, initialTheme }: { initialLocale: Locale; initialTheme: ThemePreference }) {
  const [locale, setLocale] = useState(initialLocale);
  const [theme, setTheme] = useState(initialTheme);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const m = messages[locale].settings;

  function persist(nextLocale: Locale, nextTheme: ThemePreference) {
    setLocale(nextLocale);
    setTheme(nextTheme);
    setSaved(false);
    if (typeof window !== "undefined") applyTheme(nextTheme);
    startTransition(async () => {
      await savePreferences({ locale: nextLocale, theme: nextTheme });
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 1800);
    });
  }

  const languageOptions = [
    { value: "th" as const, title: "ไทย", copy: m.thaiDescription },
    { value: "en" as const, title: "English", copy: m.englishDescription },
  ];
  const themeOptions = [
    { value: "system" as const, title: m.system, copy: m.systemDescription, icon: Laptop },
    { value: "light" as const, title: m.light, copy: m.lightDescription, icon: Sun },
    { value: "dark" as const, title: m.dark, copy: m.darkDescription, icon: Moon },
  ];

  return (
    <div className="mt-7 grid gap-7">
      <section>
        <div className="flex items-center gap-2"><Languages className="size-5 text-emerald-600 dark:text-emerald-400"/><h2 className="font-semibold">{m.language}</h2></div>
        <div className="mt-3 grid gap-2">
          {languageOptions.map((option) => (
            <button key={option.value} type="button" disabled={pending} onClick={() => persist(option.value, theme)} className={cn("flex items-center gap-3 rounded-[20px] border p-4 text-left transition", locale === option.value ? "border-emerald-500 bg-emerald-50/80 dark:border-emerald-500 dark:bg-emerald-950/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")}>
              <div className="min-w-0 flex-1"><p className="font-semibold">{option.title}</p><p className="mt-1 text-sm text-zinc-500">{option.copy}</p></div>
              {locale === option.value && <span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950"><Check className="size-4"/></span>}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold">{m.theme}</h2>
        <div className="mt-3 grid gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button key={option.value} type="button" disabled={pending} onClick={() => persist(locale, option.value)} className={cn("flex items-center gap-3 rounded-[20px] border p-4 text-left transition", theme === option.value ? "border-emerald-500 bg-emerald-50/80 dark:border-emerald-500 dark:bg-emerald-950/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")}>
                <span className="grid size-10 place-items-center rounded-2xl bg-zinc-100 dark:bg-zinc-900"><Icon className="size-5"/></span>
                <div className="min-w-0 flex-1"><p className="font-semibold">{option.title}</p><p className="mt-1 text-sm text-zinc-500">{option.copy}</p></div>
                {theme === option.value && <span className="grid size-7 place-items-center rounded-full bg-emerald-600 text-white dark:bg-emerald-400 dark:text-emerald-950"><Check className="size-4"/></span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="min-h-6 text-sm font-medium text-emerald-700 dark:text-emerald-400">{pending ? m.saving : saved ? m.saved : ""}</div>
    </div>
  );
}
