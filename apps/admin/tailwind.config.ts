import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [tailwindAnimate],
};

export default config;
