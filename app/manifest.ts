import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description: "Portfolio and CV of Alexander, a full-stack and Solidity developer building Web3 products.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#272727",
    theme_color: "#272727",
    categories: ["portfolio", "technology", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
