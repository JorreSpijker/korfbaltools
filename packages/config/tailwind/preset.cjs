// Tailwind preset consuming the shared design tokens.
// Kept in sync by hand with tokens/index.ts (CJS can't import the TS module directly).

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "oklch(0.97 0.010 258)",
          100: "oklch(0.93 0.018 258)",
          200: "oklch(0.87 0.028 258)",
          300: "oklch(0.75 0.038 258)",
          400: "oklch(0.55 0.045 258)",
          500: "#0E1C31",
          600: "oklch(0.19 0.042 258)",
          700: "oklch(0.15 0.036 258)",
          800: "oklch(0.11 0.028 258)",
          900: "oklch(0.08 0.020 258)",
          DEFAULT: "#0E1C31",
        },
        secondary: {
          50: "oklch(0.97 0.020 42)",
          100: "oklch(0.93 0.045 42)",
          200: "oklch(0.87 0.075 42)",
          300: "oklch(0.80 0.115 42)",
          400: "oklch(0.73 0.155 42)",
          500: "#F16018",
          600: "oklch(0.58 0.185 42)",
          700: "oklch(0.48 0.155 42)",
          800: "oklch(0.38 0.115 42)",
          900: "oklch(0.28 0.080 42)",
          DEFAULT: "#F16018",
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
