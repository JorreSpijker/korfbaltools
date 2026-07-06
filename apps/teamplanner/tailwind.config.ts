import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";

const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#0E1C31", // primary — primary action
          dark: "oklch(0.19 0.042 258)", // hover / pressed
          surface: "oklch(0.97 0.010 258)", // very light tint — drop zones, backgrounds
          subtle: "oklch(0.87 0.028 258)", // light border, hover bg for file inputs
        },
      },
    },
  },
  plugins: [],
};

export default config;
