import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Keptpoint",
    short_name: "Keptpoint",
    description: "Keep every point, stamp and reward together.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f7f7f6",
    theme_color: "#18181b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
