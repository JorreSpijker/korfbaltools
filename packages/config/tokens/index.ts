// Brand tokens for korfbaltools.nl — "Deep Moss Authority" (see DESIGN.md).
// Hue locked at 140° to match apps/teamplanner's own accent ramp (see its
// tailwind.config.js) so the platform shell and the tools it hosts read as
// one visual family. brand-500/600 are pinned to teamplanner's DEFAULT/dark.

export const colors = {
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
} as const;

export const fonts = {
  sans: ["Inter", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
} as const;

export const radii = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  full: "9999px",
} as const;

export const spacing = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
} as const;

export const tokens = { colors, fonts, radii, spacing } as const;
