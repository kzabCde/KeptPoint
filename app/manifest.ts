import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KeptPoint",
    short_name: "KeptPoint",
    description: "Keep every point, stamp and reward together.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#063c35",
    icons: [
      { src: "/keptpoint-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
