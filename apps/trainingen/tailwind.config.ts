import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";

// De kleuren van deze app staan in de gedeelde preset (packages/config), zodat
// main en de tools dezelfde set gebruiken. Hier blijft alleen de letter over.
const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-figtree)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
