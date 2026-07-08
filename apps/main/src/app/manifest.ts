import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Korfbaltools.nl",
    short_name: "Korfbaltools",
    description: "Tools voor korfbalclubs",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0E1C31",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
