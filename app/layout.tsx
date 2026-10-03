import type { Metadata, Viewport } from "next";
import { getPreferences } from "@/lib/preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "KeptPoint", template: "%s · KeptPoint" },
  description: "Keep every point, stamp and reward together.",
  applicationName: "KeptPoint",
  icons: {
    icon: [{ url: "/keptpoint-mark.svg", type: "image/svg+xml" }],
    shortcut: "/keptpoint-mark.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#063c35",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, theme } = await getPreferences();
  const themeScript = `
    (() => {
      const theme = ${JSON.stringify(theme)};
      const root = document.documentElement;
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => {
        const dark = theme === "dark" || (theme === "system" && media.matches);
        root.classList.toggle("dark", dark);
        root.dataset.theme = theme;
        root.style.colorScheme = dark ? "dark" : "light";
      };
      apply();
      if (theme === "system") media.addEventListener?.("change", apply);
    })();
  `;

  return (
    <html lang={locale} className={theme === "dark" ? "dark" : ""} data-theme={theme} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
