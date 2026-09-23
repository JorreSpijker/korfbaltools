// Brand tokens for korfbaltools.nl (see DESIGN.md).
// primary-500 / secondary-500 are the "main" colors — pinned to the exact
// requested hex; other steps are a generated oklch ramp at the same hue.
// primary hue (258°) is locked to match apps/teamindeling's own accent ramp
// (see its tailwind.config.js) so the platform shell and the tools it hosts
// read as one visual family.

export const colors = {
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
    50: "oklch(0.97 0.018 42)",
    100: "#FBE7DC",
    200: "oklch(0.87 0.070 42)",
    300: "#F9B06E",
    400: "oklch(0.66 0.150 42)",
    500: "#C2410C",
    600: "oklch(0.49 0.155 42)",
    700: "oklch(0.42 0.130 42)",
    800: "oklch(0.34 0.100 42)",
    900: "oklch(0.26 0.070 42)",
    DEFAULT: "#C2410C",
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
  // Oppervlakken en tekstgrijzen uit het trainingen-design
  // (docs/designs/trainingen/Design.html). Blauwgrijs in plaats van de
  // neutrale grijsschaal, zodat ze bij de navy passen.
  page: "#F4F5F7",
  ink: "#0E1C31",
  muted: "#4B5566",
  line: "#D9DEE6",
  tint: "#E7EBF2",
  outline: "#8A94A6",
  dash: "#A9B2C2",
  accent: {
    DEFAULT: "#C2410C",
    soft: "#FBE7DC",
    light: "#FFE6D5",
  },
  ok: "#1F6B3A",
  alert: "#B42318",
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
