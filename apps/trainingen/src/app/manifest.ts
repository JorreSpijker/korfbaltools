import type { MetadataRoute } from "next";

// basePath ("/trainingen", see next.config.mjs for why) isn't applied
// automatically to manifest src/start_url/scope — unlike page metadata icons.
const BASE_PATH = "/trainingen";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trainingen",
    short_name: "Trainingen",
    description: "Oefeningen zoeken en een training samenstellen voor Korfbaltools.nl",
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
