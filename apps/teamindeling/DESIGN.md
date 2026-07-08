<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: Teamindeling
description: A precise, club-agnostic team planning tool for Dutch korfball clubs.
---

# Design System: Teamindeling

## 1. Overview

**Creative North Star: "The Well-Ordered Seizoensboek"**

A season-record book, printed with care, used by every club. No ornamentation — every mark on the page carries information. The design draws from Notion's structural white space, Figma's deliberate tool-grade chrome, and the Rijksoverheid's commitment to accessible, ordered information. The tool works for the coordinator who knows the rules and wants to move through the season quickly, and for the volunteer who opens it for the first time.

White surfaces. A single authoritative accent color, used sparingly. Text that is clear and never apologetic. The interface steps aside and lets the plan be the thing. Validation state is unambiguous — not because it shouts, but because the system speaks only when it has something to say.

This system rejects: sports-scoreboard chrome (cluttered, ad-heavy, animation-for-animation's-sake); enterprise IT grey boxes (form-heavy scaffolding that makes every screen feel like a government form from 2008); and trendy SaaS minimalism used as laziness rather than purpose.

**Key Characteristics:**
- Pure white surface — no tinted backgrounds, no warmth by default
- One accent color, one accent hue, used only on active or primary-action elements
- Typographic hierarchy carries the layout — spacing and weight are the design, not color
- Validation state uses both color AND label — never color alone
- Dutch directness: no instructional padding, no redundant copy

## 2. Colors

A restrained palette: pure white ground, near-black text, one deep authoritative accent.

### Primary
- **Deep Moss Authority** [to be resolved during implementation, hue ≈ 140°, L ≈ 0.30–0.35, chroma ≈ 0.10]: The primary action color. Used on primary buttons, selected states, and focus rings. Appears on ≤10% of any given screen. Its scarcity is what makes it signal — not decoration.

### Neutral
- **Pure White** [oklch(1.000 0.000 0)]: The default background. Literal white — no warmth, no tint. The accent does the branding work; the surface does not.
- **Surface Grey** [to be resolved during implementation, L ≈ 0.97, chroma 0]: Panel and card backgrounds — a barely-visible step from white, used to separate sections without adding visual weight.
- **Authoritative Ink** [to be resolved during implementation, L ≈ 0.12–0.15, tiny hint of the primary hue]: Body text. Earns ≥7:1 contrast vs the white ground.
- **Muted Text** [to be resolved during implementation, L ≈ 0.50–0.55]: Secondary labels, captions, placeholder text. Must reach ≥4.5:1 vs white — never below threshold "for elegance."
- **Border** [to be resolved during implementation, L ≈ 0.88–0.90]: Structural dividers, card borders, input strokes.

### Named Rules

**The One Accent Rule.** The primary color appears on ≤10% of any given screen. One primary button, one active tab, one focus ring — not a dozen chips, not a colored header, not tinted section backgrounds. Its rarity is the point.

**The Never-Color-Alone Rule.** Validation state (valid / warning / invalid) must always pair color with a text label or icon. No user should need to distinguish red from amber from green to understand their data.

## 3. Typography

**Body Font:** Single humanist sans-serif [specific pairing to be chosen at implementation — warm, highly legible at small sizes, excellent Dutch/Latin character rendering. Candidates: Inter, Geist, Nunito Sans, Source Sans 3.]

**Character:** One typeface doing all the work through weight and scale. Body is the hero. Display is restrained — there are no headlines competing with the plan itself. The type should feel like a well-typeset administration document, not a marketing page.

### Hierarchy
- **Title** (medium/semibold, ≈1.125rem, tight line-height): Section headers, modal titles, team names. Text-wrap: balance.
- **Body** (regular, 0.875–1rem, 1.5 line-height): Player names, labels, descriptions. Max line length 65–75ch. Text-wrap: pretty.
- **Label** (medium, 0.75–0.8125rem, 1.25 line-height): Category badges, status pills, form labels. Letter-spacing +0.01em at smaller sizes for legibility.
- **Mono** (optional, for data): Age values, player counts, numeric exports. A neutral monospace keeps numbers aligned.

### Named Rules

**The Restraint Rule.** No display-scale headings. The largest text on any screen is ≤1.25rem. The plan is the content; the UI is the container.

## 4. Elevation

Flat by default. The visual language is tonal layering — background-color steps carry the hierarchy, not shadows. Modals and dropdown menus use a single restrained shadow to float above the surface; everything else is flat.

### Shadow Vocabulary
- **Float** [to be resolved during implementation, soft ambient]: Used only on modals, dropdowns, and the drag-ghost overlay. Not on cards, not on buttons.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. The only elevated elements are those that have left the document flow (modals, floating menus, the drag overlay). If something is in-flow, it does not have a shadow.

## 5. Components

*Omitted — seed mode. Run `/impeccable document` once components are built to capture the real tokens, shapes, and HTML/CSS snippets.*

## 6. Do's and Don'ts

### Do:
- **Do** use pure white (`oklch(1.000 0.000 0)`) as the body background. No warmth, no tint. The primary accent carries the brand.
- **Do** use the primary accent only on primary actions (one button per screen context), selected states, and focus rings.
- **Do** pair every validation color (valid/warning/invalid) with a text label — color is never the sole signal.
- **Do** carry hierarchy through weight and spacing, not color. Three weights is enough.
- **Do** write Dutch copy that is direct and unambiguous — no instructional hedging, no "Please enter your…" padding.
- **Do** use subtle tonal backgrounds (`bg-gray-50`, eventually the Surface token) to separate sections without adding visual weight.

### Don't:
- **Don't** use warm-tinted backgrounds. The whole warm-neutral band (cream / sand / ivory / linen) is the AI default of 2026. Surface warmth belongs in the accent, not the ground.
- **Don't** let the primary accent appear on more than 10% of any given screen. Multiple colored buttons, colored headers, and tinted section panels all violate The One Accent Rule.
- **Don't** use color alone to indicate validation state. Red/amber/green must always be paired with a label or icon label.
- **Don't** use loud sports-scoreboard chrome — no ad-adjacent dense grids, no oversized colored banners, no blinking or flashing state.
- **Don't** build enterprise grey-box scaffolding — no nested grey panels, no form-per-field-label layouts that feel like SharePoint.
- **Don't** use shadows on in-flow surfaces. Cards, panels, stat chips, and table rows are flat. Only true floating layers (modals, menus, drag overlays) earn a shadow.
- **Don't** use side-stripe borders (`border-left` > 1px as a colored accent). Rewrite with background tints or full borders.
