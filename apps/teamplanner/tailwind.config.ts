import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";

const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "oklch(0.32 0.10 140)", // Deep Moss Authority — primary action
          dark: "oklch(0.26 0.09 140)", // hover / pressed
          surface: "oklch(0.95 0.025 140)", // very light tint — drop zones, backgrounds
          subtle: "oklch(0.85 0.06 140)", // light border, hover bg for file inputs
        },
      },
    },
  },
  plugins: [],
};

export default config;
