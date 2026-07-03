import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";

const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
