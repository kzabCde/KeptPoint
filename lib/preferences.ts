import "server-only";
import { cookies, headers } from "next/headers";
import { localeFromAcceptLanguage, type Locale } from "@/lib/i18n";

export type ThemePreference = "system" | "light" | "dark";

export const LOCALE_COOKIE = "kp_locale";
export const THEME_COOKIE = "kp_theme";

export function isLocale(value: unknown): value is Locale {
  return value === "th" || value === "en";
}

export function isTheme(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export async function getPreferences() {
  const store = await cookies();
  const rawLocale = store.get(LOCALE_COOKIE)?.value;
  const rawTheme = store.get(THEME_COOKIE)?.value;
  const locale = isLocale(rawLocale)
    ? rawLocale
    : localeFromAcceptLanguage((await headers()).get("accept-language"));
  return {
    locale,
    theme: isTheme(rawTheme) ? rawTheme : "system",
  } as const;
}

export async function getLocale() {
  return (await getPreferences()).locale;
}

export async function setPreferenceCookies(locale: Locale, theme: ThemePreference) {
  const store = await cookies();
  const options = {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
  store.set(LOCALE_COOKIE, locale, options);
  store.set(THEME_COOKIE, theme, options);
}
