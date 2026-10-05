import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PumpPoint",
    short_name: "PumpPoint",
    description: "Collect points, earn rewards, and go further with every visit.",
    start_url: "/home",
    display: "standalone",
    background_color: "#F7F9FC",
    theme_color: "#0F2D46",
    icons: [
      {
        src: "/pumppoint-mark.svg",
        sizes: "256x256",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
