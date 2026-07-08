import type { MetadataRoute } from "next";

// basePath ("/teamplanner", see next.config.mjs for why) isn't applied
// automatically to manifest src/start_url/scope — unlike page metadata icons.
const BASE_PATH = "/teamplanner";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Teamindeling Tool",
    short_name: "Teamplanner",
    description: "Teamindeling voor Korfbaltools.nl",
    start_url: BASE_PATH,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0E1C31",
    icons: [
      { src: `${BASE_PATH}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE_PATH}/icon-512-maskable.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
