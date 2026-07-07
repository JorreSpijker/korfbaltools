---
name: Korfbaltools.nl
description: The shared voordeur for club volunteers — calm, flat, navy-and-orange, one visual family across main, admin and every tool it hosts.
colors:
  vaandelmarine: "#0E1C31"
  vaandelmarine-tint: "oklch(0.93 0.018 258)"
  vaandelmarine-border: "oklch(0.75 0.038 258)"
  vaandelmarine-panel: "oklch(0.55 0.045 258)"
  vaandelmarine-hover: "oklch(0.19 0.042 258)"
  vaandelmarine-deep: "oklch(0.15 0.036 258)"
  vaandelmarine-pressed: "oklch(0.11 0.028 258)"
  signaaloranje: "#F16018"
  signaaloranje-hover: "oklch(0.58 0.185 42)"
  paper: "#fafafa"
  neutral-outline: "#d4d4d4"
  neutral-border: "#e5e5e5"
  neutral-muted: "#737373"
  neutral-body: "#525252"
  neutral-ink: "#171717"
  success: "#16a34a"
  warning: "#ca8a04"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.vaandelmarine}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.vaandelmarine-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-nav-pill:
    backgroundColor: "{colors.signaaloranje}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  button-nav-pill-hover:
    backgroundColor: "{colors.signaaloranje-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  card-app:
    backgroundColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "20px"
  card-app-locked:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Korfbaltools.nl

## 1. Overview

**Creative North Star: "De Voordeur" (The Front Door)**

Korfbaltools.nl is the single voordeur club volunteers walk through before every tool behind it — Teamplanner today, more later. The system reads as a doorway, not a destination: calm, flat, wayfinding-first. Its one recurring signature — the angular pennant corner (`NavShape`) cut into the nav bar, footer and admin toggle — is the only decorative flourish the system allows itself, and it earns its place by doing a job: marking edges and thresholds, literally shaped like a small flag planted at each corner. Everything else is plain type, flat color fields, and borders instead of shadows.

This system explicitly rejects felle sportkleuren, scoreboard-chrome, ad-achtige dichte layouts and uitroeptekens — the korfbal-scoreboard-app cliché PRODUCT.md names directly. It equally rejects generic SaaS landing-page scaffolding: no hero-metric blocks, no fabricated testimonials or "vertrouwd door X clubs" logo rows, no Notion/Linear-style trendy minimalism standing in for a real identity, and no enterprise-grey forms-on-forms scaffolding. The platform is honest about its early stage — one working tool, more coming — and the interface says so in plain Dutch rather than dressing up an empty roadmap.

**Key Characteristics:**
- Flat in-flow surfaces — depth comes from borders and neutral tints, not elevation. The one shadow in the system is reserved for the overlay layer (dialogs, popovers, dropdowns).
- One signature shape (the pennant corner) repeated, never new decorative motifs invented per screen.
- Deep navy carries structure and authority; orange is reserved for the handful of moments that ask for action.
- Dutch, direct, sentence-case copy — no marketing voice, no uppercase eyebrows.

## 2. Colors

Two committed brand colors — a near-black navy and a single vivid orange — sit on a plain gray neutral scale. The strategy is restrained: navy carries structure everywhere (nav, footer, headings, primary buttons), orange is rationed to genuine calls to action.

### Primary
- **Diepe Vaandelmarine** (`#0E1C31`): the structural color of the whole platform — nav bar fill, footer fill, primary buttons, the pennant-corner shape itself, and heading text (at the `vaandelmarine-hover` step, see below) on the homepage hero. It is the platform's authority color: used generously, never as decoration.
- **Vaandelmarine Tint** (`oklch(0.93 0.018 258)`): the lightest step, used only as an icon-tile background behind app icons on the homepage grid.
- **Vaandelmarine Border** (`oklch(0.75 0.038 258)`): hover-state border color for app cards — the only mid-tone step in active use.
- **Vaandelmarine Panel** (`oklch(0.55 0.045 258)`): background for the account/mobile dropdown menu panel — a lighter step than the bar itself, so the open menu reads as a distinct surface above it.
- **Vaandelmarine Hover** (`oklch(0.19 0.042 258)`): button hover/pressed fill, and doubles as the heading color (`text-primary-600`) on the homepage hero and section icons.
- **Vaandelmarine Deep** (`oklch(0.15 0.036 258)`): icon fill inside the "Teamplanner" feature callout.
- **Vaandelmarine Pressed** (`oklch(0.11 0.028 258)`): hover fill for the floating admin-panel toggle.

### Secondary
- **Signaaloranje** (`#F16018`): the platform's one accent, and the logo mark's own color. Reserved for the unauthenticated nav's "Account aanmaken" pill and the small nav-pill app links — genuine calls to action, never body decoration. On the unauthenticated pill it sits inverted (orange fill, navy text) rather than the usual white-on-color, a deliberate one-off contrast flip worth preserving.
- **Signaaloranje Hover** (`oklch(0.58 0.185 42)`): hover fill for every orange element above.

### Neutral
- **Paper** (`#fafafa`): card background for "coming soon" / locked states, and page-level surface behind the app grid.
- **Neutral Outline** (`#d4d4d4`): border for admin's `outline` button variant — a step darker than the standard divider, reserved for elements that need to read as a control (bordered button) rather than a passive divider.
- **Neutral Border** (`#e5e5e5`): every hairline divider and card border across main and admin, and the border on every portaled overlay (dialog, popover, select, dropdown).
- **Neutral Muted** (`#737373`): secondary icon color, disabled-state text.
- **Neutral Body** (`#525252`): default body copy color — descriptions, paragraph text, nav links at rest.
- **Neutral Ink** (`#171717`): headings and emphasized inline text (card titles, feature names).

### Semantic
- **Success** (`#16a34a`), **Warning** (`#ca8a04`), **Danger** (`#dc2626`): system-level states. Danger is the only one currently rendered (form validation errors); success/warning are reserved tokens for future states — don't invent new hues for them when they're needed.

### Named Rules
**The One Accent Rule.** Signaaloranje appears only on elements that trigger an action (register CTA, app-launch pills). It never appears as a background tint, a heading color, or body decoration. If orange shows up anywhere passive, that's a bug, not a style choice.

**The Shared-Family Rule.** Vaandelmarine's hue (258°) is locked to match `apps/teamplanner`'s own `accent` color family (see its `tailwind.config.ts`), so the platform shell and the tool it hosts read as one visual family, not two projects sharing a login screen. Any new app added to the platform inherits this same navy, not a new brand color.

## 3. Typography

**Display / Body Font:** Inter (with system-ui, sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (declared as the platform mono stack; not yet rendered in main/admin UI — reserved for future code/data display)

**Character:** A single, quiet sans across every weight. No display serif, no second brand typeface — the restraint itself is the personality, matching "onopvallende autoriteit."

### Hierarchy
- **Display** (600, `clamp(2.25rem, 4vw, 3rem)`, 1.1): the homepage `<h1>` only — "Korfbaltools.nl" — in Vaandelmarine Hover, the single largest moment on the whole platform.
- **Headline** (600, `clamp(1.5rem, 2.5vw, 1.875rem)`, 1.25): section headings within the homepage ("Één account, alle tools voor je club", "Hoe het werkt").
- **Title** (600, 1.25rem): page-level form titles (login/register `<h1>`), the "Apps" section label, feature-card titles.
- **Body** (400, 1rem, 1.6): descriptive paragraph copy under headings. Capped at `max-w-xl` (≈65ch) wherever it appears as prose.
- **Label** (400, 0.875rem, 1.4): form field labels, nav links, card descriptions, footer links. Sentence case throughout — never uppercase, never letter-spaced as a kicker.

### Named Rules
**The No-Eyebrow Rule.** No small-caps tracked labels above headings anywhere in the system. Section headings stand alone; hierarchy comes from size and weight, not a kicker line.

## 4. Elevation

Flat at rest, everywhere content stays in the document flow: cards, buttons, the nav bar, badges. Depth there is conveyed with a 1px `neutral-border` hairline and, for disabled/locked states, a shift to the `paper` background plus a dashed border. Shadows exist, but strictly for the portaled overlay layer — dialog, popover, select, dropdown-menu (`apps/admin`'s shadcn primitives) all use the same single `shadow-lg` value, and nothing else does. The pennant corner is the system's other depth cue: it marks an edge by cutting a flag shape into it, not by lifting it with a shadow.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`, Tailwind `shadow-lg`): the one shadow in the system. Used only on Radix-portaled surfaces (dialog, popover, select content, dropdown-menu) that render above the page.

### Named Rules
**The Flat-By-Default Rule.** If it stays in the document flow, it has no shadow, including on hover — hover shifts a border color (`neutral-border` → `vaandelmarine-border`) or a background fill instead. Shadows are reserved for the one tier of surfaces that leave the flow: dialogs, popovers, selects, dropdown menus.

## 5. Components

Buttons, cards and inputs are plain and rectangular-adjacent (never sharp corners, never pill-shaped except the small nav pills). The one shaped exception, the pennant corner, is documented separately below.

### Buttons
- **Shape:** `rounded-md` (0.5rem) for primary actions; `rounded-sm` (0.25rem) for the small in-nav app pills.
- **Primary:** Vaandelmarine fill, white text, `px-4 py-2` — the register CTA and login submit both use this exact treatment.
- **Nav pill:** Signaaloranje fill, white text, `px-2 py-1` — used for the small app-launch links inside the nav bar's pennant-cornered pill.
- **Inverted (unauthenticated nav CTA):** Signaaloranje fill with **Vaandelmarine text** (not white) — the system's one deliberate contrast flip, reserved for the "Account aanmaken" link inside the toolbar.
- **Outline (apps/admin):** white fill, `neutral-outline` border, `neutral-ink` text — secondary actions like "Wachtwoord resetten". Hover fills `paper`.
- **Destructive (apps/admin):** `danger` fill, white text, for irreversible admin actions (deactivate, delete) only. Hover dims to 90% opacity, not a darker shade.
- **Ghost (apps/admin):** transparent at rest, `paper` fill on hover, no border — lowest-emphasis action in a row (table row actions).
- **Hover / Focus:** background steps one tone darker (`vaandelmarine` → `vaandelmarine-hover`, `signaaloranje` → `signaaloranje-hover`); no transform, no shadow.
- **Disabled:** `opacity-50`, no other visual change.

### Chips
- **Style:** `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium` — the only fully pill-shaped element besides the small nav pills.
- **Default:** `vaandelmarine-tint` background, `vaandelmarine-deep` text — capability/role badges in the admin users table.
- **Success / Danger:** the semantic color at 10% opacity as background, the solid semantic color as text (e.g. `danger` at 10% behind, solid `danger` text) — never a solid semantic fill at chip scale.

### Cards / Containers
- **Corner Style:** `rounded-lg` (0.75rem) uniformly — the only place `lg` radius appears.
- **Background:** white for accessible/available items; `paper` (`#fafafa`) for locked/"coming soon" items.
- **Border:** solid `neutral-border` at rest, shifting to `vaandelmarine-border` on hover for interactive cards; `border-dashed neutral-border` for locked cards — dashed is the system's only visual vocabulary for "not yet available."
- **Shadow Strategy:** none — see Elevation.
- **Internal Padding:** `p-5` (20px) for grid cards, `p-6` (24px) for the wider feature callouts.

### Inputs / Fields
- **Style:** `rounded-md`, plain 1px border, white background, `px-3 py-2`.
- **Focus:** browser default outline — no custom focus ring currently implemented (a gap worth closing; track separately, don't silently invent a treatment here).
- **Error:** field-level message in `danger` (`#dc2626`) directly beneath the input, never a red border or background tint.

### Navigation
- **Style:** full-width Vaandelmarine bar, pennant-cornered at both top edges, sticky (`sticky top-0`). Logo tile expands on hover to reveal the wordmark. App links render as Signaaloranje pills at the bar's center. Account menu is a Radix dropdown on Vaandelmarine Panel (a lighter navy than the bar itself, for contrast against the panel).
- **Mobile:** the app-pill row and account menu collapse into a single hamburger dropdown at the bar's right edge; same pennant-corner treatment carries over.

### Pennant Corner (signature component)
The `NavShape` — a small angular flag SVG (`viewBox 0 0 60 60`, rendered at 16×16px) — is the system's one recurring decorative device. It appears in mirrored pairs bracketing the nav bar, the footer, and the floating admin toggle, always filled with the surface's own background color so it reads as a cut corner rather than an applied sticker. `flipHorizontal` / `flipVertical` props mirror it to bracket any rectangular surface. New chrome elements (a future toolbar, a new app's header) should reuse this exact shape rather than inventing a new corner treatment.

## 6. Do's and Don'ts

### Do:
- **Do** use Vaandelmarine (`#0E1C31`) as the platform's only structural color — nav, footer, primary buttons, headings.
- **Do** ration Signaaloranje (`#F16018`) to genuine calls to action only.
- **Do** use the pennant-corner `NavShape` for any new chrome that needs a corner treatment, instead of inventing a new decorative shape.
- **Do** convey depth with a `neutral-border` hairline or a `paper` background shift — never a shadow.
- **Do** keep copy in direct Dutch sentence case ("Inloggen", not "Log hier eenvoudig in!").

### Don't:
- **Don't** introduce felle sportkleuren, scoreboard-chrome, or uitroeptekens — the korfbal-scoreboard-app cliché this platform explicitly rejects.
- **Don't** add hero-metric blocks, fabricated testimonials, or "vertrouwd door X clubs" claims — this is an early-stage platform with one working tool; the copy stays honest about that.
- **Don't** add a `box-shadow` anywhere. If a component looks like it needs one to separate from the page, give it a border instead.
- **Don't** add an uppercase tracked eyebrow above any section heading.
- **Don't** invent a second brand typeface. Inter carries every weight the system needs.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or callouts.
