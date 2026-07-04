---
name: Korfbaltools.nl
description: The reception desk for a family of korfball club tools — calm, direct, no waiting room.
colors:
  brand-50: "oklch(0.95 0.025 140)"
  brand-100: "oklch(0.90 0.045 140)"
  brand-200: "oklch(0.85 0.06 140)"
  brand-300: "oklch(0.72 0.09 140)"
  brand-400: "oklch(0.55 0.10 140)"
  brand-500: "oklch(0.32 0.10 140)"
  brand-600: "oklch(0.26 0.09 140)"
  brand-700: "oklch(0.21 0.08 140)"
  brand-800: "oklch(0.16 0.06 140)"
  brand-900: "oklch(0.12 0.045 140)"
  neutral-50: "#fafafa"
  neutral-100: "#f5f5f5"
  neutral-200: "#e5e5e5"
  neutral-300: "#d4d4d4"
  neutral-500: "#737373"
  neutral-600: "#525252"
  neutral-900: "#171717"
  white: "#ffffff"
  success: "#16a34a"
  warning: "#ca8a04"
  danger: "#dc2626"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brand-600}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.neutral-900}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  app-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-default:
    backgroundColor: "{colors.brand-100}"
    textColor: "{colors.brand-700}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: Korfbaltools.nl

## 1. Overview

**Creative North Star: "De Ontvangstbalie" (The Reception Desk)**

Korfbaltools.nl is the desk you check in at before you're pointed to where you need to be — and, for a first-time visitor, the desk that also explains what this place is. A returning coach lands here to log in, then leaves for the tool they came for (Teamplanner today, more later); the hero's job is to make that handoff instant. A new visitor who's never heard of the platform gets a calm, concrete explanation below the fold — what it is, what it does today, how it works — before being asked to register. Neither job crowds out the other: the hero stays a functional login/register moment, the sections below carry the explaining. No hype, no invented traction, no scroll-driven storytelling for its own sake — the platform is early-stage and the copy says so by simply not claiming otherwise.

The hue is deliberately shared with apps/teamplanner's "Deep Moss Authority" — same 140° green, carried through as the one accent across the platform shell (main, admin) and the tools it hosts, so the whole system reads as one family rather than a shell bolted onto unrelated tools. This system rejects korfbal-scoreboard/sport-app clichés (bright sport colors, scoreboard chrome, ad-dense layouts, exclamation-mark copy), trendy SaaS minimalism used as a substitute for identity (unbranded Notion/Linear look-alikes), and enterprise IT scaffolding (grey box-in-a-box forms).

**Key Characteristics:**
- One accent hue (140° moss green) shared platform-wide, used sparingly on primary actions and headings/links — never as a background wash
- Pure white and light-neutral surfaces; the accent, not the ground, carries identity
- Flat by default — no shadows on cards, buttons, or badges; shadows exist only on things that have left the document flow (dialogs, dropdowns, popovers, selects)
- Dutch, direct copy — form labels state the action ("Inloggen", "Opslaan"); explanatory sections state facts concretely, never in hype or superlatives
- Same visual family as apps/teamplanner: shared accent hue, shared restraint, distinct component library (raw Tailwind here, shadcn/ui in apps/admin) unified by the same tokens

## 2. Colors

A restrained, single-accent palette: white and light-neutral surfaces, near-black text, one authoritative green used only where something is clickable or actively true.

### Primary
- **Deep Moss Authority** (`oklch(0.32 0.10 140)`, `brand-500`): The one accent. Primary buttons, active nav state. Deliberately dark for its role — this is a 500-step that reads more like a 700 on a typical scale, chosen for quiet authority rather than a bright mid-tone. White text on this background clears AA contrast comfortably.
- **Deep Moss Authority — Pressed** (`oklch(0.26 0.09 140)`, `brand-600`): Hover/active state for primary buttons, and the color for headings and inline links on a white ground (`text-brand-600`) — dark enough to double as body-safe text, not just a button color.
- **Moss Tint** (`oklch(0.90 0.045 140)` / `oklch(0.85 0.06 140)`, `brand-100`/`brand-200`): Light background tint for badges and subtle highlighted states. Never used as a page or section background — the tint marks something specific, it doesn't wash a surface.

### Neutral
- **White** (`#ffffff`): Default surface for cards, forms, panels, the toolbar. No warm or cool tint — the accent carries the brand, the ground stays neutral.
- **Neutral 50** (`#fafafa`): The hero section wash on the homepage — the only place a tinted background is used, to separate the hero from the apps grid below without a hard line.
- **Neutral 200** (`#e5e5e5`): Structural borders — card borders, input borders, the toolbar's bottom border, table dividers.
- **Neutral 600** (`#525252`): Secondary/body text on white — taglines, descriptions, muted labels. Never lighter than this for body copy.
- **Neutral 900** (`#171717`): Primary text, and — deliberately — the checked state of checkboxes. Selection/utility controls stay neutral so the one accent color isn't diluted onto non-primary actions.

### Semantic
- **Success** (`#16a34a`), **Warning** (`#ca8a04`), **Danger** (`#dc2626`): Form/validation feedback only (error text under fields, destructive button variant, "Opgeslagen" confirmation). Not used decoratively.

### Named Rules
**The One Accent Rule.** Moss green appears only on primary buttons, active/hover states, and heading/link text — never as a section background, a card wash, or a decorative stripe. If you're reaching for brand color on a checkbox or a badge's border, reach for neutral instead (see the checkbox's neutral-900 checked state).

**The Shared-Family Rule.** This hue (140°) is not this app's alone — it's the platform's, shared verbatim with apps/teamplanner. A new tool joining the platform inherits this accent rather than picking its own; a distinct tool-specific accent would break the "one platform" read this system is built to protect.

## 3. Typography

**Body Font:** Inter, with `system-ui, sans-serif` fallback.
**Mono Font:** JetBrains Mono, with `monospace` fallback — reserved for future tabular/data display (audit-log IDs, exports); not yet used in a rendered UI surface.

**Character:** A single humanist-geometric sans doing all the work through size and weight. There is no display typeface competing for attention — even the homepage hero caps out at a modest 3rem, because this is a reception desk, not a landing page.

### Hierarchy
- **Display** (semibold/600, `clamp(1.875rem, 4vw, 3rem)`, line-height 1.1): The homepage hero heading only. `text-wrap: balance` — this is the single largest text anywhere on the platform.
- **Title** (semibold/600, 1.25rem–1.5rem, line-height 1.3): Page titles ("Inloggen", "Gebruikersbeheer"), the "Apps" section heading.
- **Body** (regular/400, 1rem, line-height 1.5): Paragraph copy, form values. Max line length ~65ch on the hero tagline.
- **Label** (medium/500, 0.875rem, line-height 1.25): Form labels, nav links, card titles, table headers.
- **Micro** (regular/400, 0.75rem, line-height 1.25): Badge text, timestamps, helper captions.

### Named Rules
**The Modest Ceiling Rule.** No heading on this platform exceeds `3rem`. The plan, the form, the user's task is the content; the platform chrome does not compete with it for size.

## 4. Elevation

Flat by default, platform-wide — the same rule apps/teamplanner uses. Surfaces at rest (cards, buttons, badges, table rows, the toolbar) carry zero box-shadow; hierarchy comes from border color and background-tint steps, not from lift. The only elements that earn a shadow are ones that have left the normal document flow: dialogs, dropdown menus, select popovers, and popovers proper — all `shadow-lg`, all in apps/admin's shadcn-based components.

### Shadow Vocabulary
- **Float** (`shadow-lg`): Dialogs, dropdown-menu content, select content, popover content. Nothing that stays in-flow gets this — a homepage app-card's hover state is a border-color shift (`hover:border-brand-300`), not a shadow.

### Named Rules
**The Flat-By-Default Rule.** If it's in the document flow, it has no shadow — full stop, including on hover. Shadows are reserved for things that render above the page (modals, menus, popovers). This matches apps/teamplanner exactly, on purpose.

## 5. Components

### Buttons
- **Shape:** `rounded-md` (0.5rem), consistent across every button on the platform regardless of which component library rendered it.
- **Primary:** `brand-500` background, white text, `brand-600` on hover. Padding `8px 16px` (`px-4 py-2`), `disabled:opacity-50`. This is the only button style used in apps/main's raw forms (login, register, account) — one recipe, hand-written each time rather than a shared component, which is why it must stay pixel-identical across files.
- **Outline** (apps/admin only): White background, `neutral-300` border, `neutral-100` on hover. Used for non-destructive secondary actions ("Wachtwoord resetten").
- **Destructive** (apps/admin only): `danger` background, white text, 90%-opacity on hover. Reserved for irreversible actions (deactivate, delete) — never used for anything reversible.
- **Ghost** (apps/admin only): Transparent, `neutral-100` background on hover only. Used inside dropdown/command menus.

### Badges (apps/admin)
- **Shape:** Fully rounded (`rounded-full`), `px-2.5 py-0.5`, `text-xs font-medium`.
- **Default:** `brand-100` background, `brand-700` text — the only place the accent appears as a background tint rather than a solid fill, and only at badge scale (a capability tag), never at card or section scale.
- **Neutral/Success/Danger variants:** Same shape, swap to the matching semantic color pair at 10% background opacity.

### App Cards (homepage grid)
- **Shape:** `rounded-lg` (0.75rem) — the one component that steps up from the platform's usual `rounded-md`, marking it as the primary content of the page rather than chrome.
- **Background:** White, `neutral-200` border.
- **Hover:** Border shifts to `brand-300`. No shadow (see Elevation).
- **Locked state:** When a capability isn't visible or the app isn't built yet, the card drops to a dashed `neutral-200` border on `neutral-50`, with a small "Binnenkort" label — never hidden entirely, so the platform's full app roster stays legible even to a first-time visitor. Text stays at full opacity: muting via `opacity` on a block that contains text drags body copy below the 4.5:1 AA floor (measured ~3:1 at 60% on white) — the dashed border and label carry the "not yet available" signal instead.

### Inputs / Fields
- **Style:** `rounded-md`, bare `border` (inherits Tailwind's default neutral border), `px-3 py-2`. Identical across login, register, account, and reset-password — one recipe, no variants.
- **Label:** `text-sm`, directly above the field, no floating-label tricks.
- **Error:** `text-sm text-danger` directly beneath the field — never a border-color-only signal.

### Navigation (KorfbalToolBar, packages/ui — shared by main and admin)
- **Style:** White background, `neutral-200` bottom border, `px-6 py-3`.
- **Logo/home link:** `brand-600` text, `font-semibold` — the one place the accent appears as text at title scale.
- **Logged out:** Plain "Inloggen" text link plus a solid `brand-500` "Account aanmaken" button — the two entry points the whole platform exists to hand you to.
- **Logged in:** A neutral (not brand-colored) dropdown trigger showing the user's name — account actions are neutral-weight, not accent-weight, since they're not the primary action of the page.

## 6. Do's and Don'ts

### Do:
- **Do** use `brand-500`/`brand-600` (`oklch(0.32 0.10 140)` / `oklch(0.26 0.09 140)`) as the only accent, shared verbatim with apps/teamplanner, so the platform and its tools read as one family.
- **Do** keep every surface flat at rest — cards, buttons, badges, table rows. Shadows only on dialogs, dropdowns, selects, and popovers.
- **Do** pair every validation/error state with a text label, never color alone (same rule as apps/teamplanner).
- **Do** write Dutch, direct copy everywhere: form actions stay verb-only ("Inloggen", "Opslaan"); the homepage's marketing sections explain concretely ("dit is wat het doet"), never in hype or superlatives.
- **Do** keep headings under `3rem` everywhere. The homepage hero is the ceiling, not a starting point for future pages.
- **Do** use neutral-900 (not the brand accent) for utility controls like checkboxes — the accent stays reserved for primary actions.
- **Do** keep the homepage's marketing sections honest about the platform's early stage — real, concrete descriptions of what Teamplanner does today, not fabricated numbers, logos, or testimonials.

### Don't:
- **Don't** reach for korfbal-scoreboard/sport-app chrome — bright sport colors, dense ad-like grids, blinking or flashing state, exclamation-mark copy.
- **Don't** add a shadow to anything that stays in the document flow, including on hover. If it needs to feel "lifted," that's a signal it should be a dialog/popover, not a card with a shadow bolted on.
- **Don't** use the accent as a section or card background wash. It marks primary actions and links; a tinted panel dilutes the one-accent read (badges are the one deliberate exception, at badge scale only).
- **Don't** fabricate social proof — no invented club counts, logos, or testimonials. The platform is early-stage; the marketing sections sell on clarity and concreteness, not borrowed trust that doesn't exist yet.
- **Don't** reach for SaaS-landing clichés in the new sections: no hero-metric blocks, no gradient text, no tiny tracked eyebrow above every section, no identical icon-card grids repeated more than once.
- **Don't** apply `opacity` to a block that contains body text to signal a disabled/locked/future state — it dims the text along with the chrome and drops contrast below AA (60% opacity on `neutral-600`/white measures ~3:1). Use a dashed border, a muted background tint, and an explicit label instead; leave text at full opacity.
- **Don't** give apps/admin's shadcn components a different accent than apps/main's raw Tailwind components. Both read `brand-500`/`brand-600` from the same `packages/config` preset — never hardcode a one-off hex/oklch value in either app.
- **Don't** use generic Tailwind stock colors (the old `orange-500` placeholder this palette replaced) — every color on this platform should trace back to a named token in `packages/config/tokens`.
