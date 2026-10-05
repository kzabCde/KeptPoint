import type { Metadata, Viewport } from "next";
import { getPreferences } from "@/lib/preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PumpPoint", template: "%s · PumpPoint" },
  description: "Collect points, earn rewards, and go further with every visit.",
  applicationName: "PumpPoint",
  icons: {
    icon: [{ url: "/pumppoint-mark.svg", type: "image/svg+xml" }],
    shortcut: "/pumppoint-mark.svg",
    apple: [{ url: "/pumppoint-mark.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0F2D46",
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
