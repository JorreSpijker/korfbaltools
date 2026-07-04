// Tailwind preset consuming the shared design tokens.
// Kept in sync by hand with tokens/index.ts (CJS can't import the TS module directly).

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "oklch(0.95 0.025 140)",
          100: "oklch(0.90 0.045 140)",
          200: "oklch(0.85 0.06 140)",
          300: "oklch(0.72 0.09 140)",
          400: "oklch(0.55 0.10 140)",
          500: "oklch(0.32 0.10 140)",
          600: "oklch(0.26 0.09 140)",
          700: "oklch(0.21 0.08 140)",
          800: "oklch(0.16 0.06 140)",
          900: "oklch(0.12 0.045 140)",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        success: "#16a34a",
        warning: "#ca8a04",
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
    },
  },
};
