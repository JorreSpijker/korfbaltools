# Scoreformulier MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of `apps/scoreformulier` — a client-only, offline-capable tool to log schotpogingen and tegendoelpunten live during a korfbal match, stored in IndexedDB, with a chronological editable log.

**Architecture:** New Next.js app `apps/scoreformulier` (multi-zone, same pattern as `apps/vastspelen`), client-only (no server actions, no Prisma). Pure domain logic (stand/percentages/state transitions) lives in a new isolated, vitest-tested package `@korfbaltools/scoreformulier-logic`. Persistence via `idb` (thin IndexedDB wrapper). All live-match state flows through one `useReducer`, mirrored to IndexedDB on every dispatch.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind (shared `@korfbaltools/config` preset), `idb` for IndexedDB, `vitest` for pure-logic unit tests.

## Global Constraints

- Package manager: pnpm (workspace `apps/*`, `packages/*`) — never `npm`/`yarn`.
- No auth/login, no server/database — everything client-side, one shared device per match (see spec section 1).
- No PWA-shell (no service worker/manifest) — the spec's explicit MVP scope decision; the browser tab is assumed to stay open for the whole match.
- Follow monorepo multi-zone app convention exactly (`basePath`, `transpilePackages`, rewrite block in `apps/main`) — same shape as `apps/vastspelen`'s `next.config.mjs`.
- Colors/buttons: use only the tokens in `packages/config/tailwind/preset.cjs` (`primary`, `secondary`, `neutral`, `success`, `warning`, `danger`) per `DESIGN.md`'s Buttons section — primary fill for the main affirmative action, outline (`border-neutral-300`) for secondary choices, `danger` fill only for irreversible deletes. Do not invent new colors (e.g. no raw `green-600`).
- Never read, edit, or commit `.env`/`.env.local` files.
- Pure logic (reducer, derived calculations) gets vitest unit tests. IndexedDB wrapper and React hooks/components are integration code — verified via manual browser smoke test, not unit tests (this was an explicit, approved spec decision, not an oversight).

---

## File Structure Overview

```
packages/scoreformulier-logic/
  package.json, tsconfig.json, eslint.config.js
  src/types.ts
  src/bereken-stand.ts (+ .test.ts)
  src/bereken-schotpercentages.ts (+ .test.ts)
  src/match-reducer.ts (+ .test.ts)
  src/index.ts

apps/scoreformulier/
  package.json, next.config.mjs, tsconfig.json, eslint.config.mjs, postcss.config.mjs, tailwind.config.ts
  src/app/layout.tsx, src/app/globals.css, src/app/page.tsx
  src/app/wedstrijd/[id]/page.tsx
  src/app/wedstrijd/[id]/log/page.tsx
  src/lib/db.ts
  src/lib/use-match.ts
  src/components/MatchStartForm.tsx
  src/components/Modal.tsx
  src/components/ShotForm.tsx
  src/components/ConcedeForm.tsx
  src/components/LiveMatchScreen.tsx
  src/components/MatchLog.tsx

apps/main/next.config.mjs (modified — add scoreformulier rewrite block)
```

---

### Task 1: Scaffold `packages/scoreformulier-logic` + domain types

**Files:**
- Create: `packages/scoreformulier-logic/package.json`
- Create: `packages/scoreformulier-logic/tsconfig.json`
- Create: `packages/scoreformulier-logic/eslint.config.js`
- Create: `packages/scoreformulier-logic/src/types.ts`
- Create: `packages/scoreformulier-logic/src/index.ts`

**Interfaces:**
- Produces: `ScoreType` (`"afstand" | "doorloop" | "strafworp"`), `SchotResultaat` (`"raak" | "mis"`), `Helft` (`1 | 2`), `SchotPoging`, `TegenDoelpunt`, `Wedstrijd` — used by every later task.

- [ ] **Step 1: Create the package manifest**

`packages/scoreformulier-logic/package.json`:
```json
{
  "name": "@korfbaltools/scoreformulier-logic",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@korfbaltools/config": "workspace:*",
    "eslint": "^9.17.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create tsconfig and eslint config**

`packages/scoreformulier-logic/tsconfig.json`:
```json
{
  "extends": "@korfbaltools/config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`packages/scoreformulier-logic/eslint.config.js`:
```js
import { baseConfig } from "@korfbaltools/config/eslint";

export default baseConfig;
```

- [ ] **Step 3: Create domain types**

`packages/scoreformulier-logic/src/types.ts`:
```ts
export type ScoreType = "afstand" | "doorloop" | "strafworp";
export type SchotResultaat = "raak" | "mis";
export type Helft = 1 | 2;

export interface SchotPoging {
  id: string;
  wedstrijdId: string;
  schutterNaam: string;
  helft: Helft;
  minuut: number;
  scoreType: ScoreType;
  resultaat: SchotResultaat;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface TegenDoelpunt {
  id: string;
  wedstrijdId: string;
  verdedigerNaam: string;
  helft: Helft;
  minuut: number;
  aangemaaktOp: string;
  gewijzigdOp: string;
}

export interface Wedstrijd {
  id: string;
  datum: string;
  tegenstander: string | null;
  teamNamen: string[];
  status: "bezig" | "afgerond";
  huidigeHelft: Helft;
  helftGestart: boolean;
}
```

- [ ] **Step 4: Create the barrel file**

`packages/scoreformulier-logic/src/index.ts`:
```ts
export * from "./types";
```

- [ ] **Step 5: Install and verify**

Run: `pnpm install`
Expected: workspace links `@korfbaltools/scoreformulier-logic`, no errors.

Run: `pnpm --filter @korfbaltools/scoreformulier-logic typecheck`
Expected: passes with no errors (no source yet beyond types, which compile cleanly).

- [ ] **Step 6: Commit**

```bash
git add packages/scoreformulier-logic
git commit -m "feat(scoreformulier-logic): scaffold package with domain types"
```

---

### Task 2: `berekenStand` — eindstand uit acties

**Files:**
- Create: `packages/scoreformulier-logic/src/bereken-stand.ts`
- Test: `packages/scoreformulier-logic/src/bereken-stand.test.ts`
- Modify: `packages/scoreformulier-logic/src/index.ts`

**Interfaces:**
- Consumes: `SchotPoging`, `TegenDoelpunt` from `./types`
- Produces: `Stand` (`{ eigen: number; tegenstander: number }`), `berekenStand(schotpogingen: SchotPoging[], tegendoelpunten: TegenDoelpunt[]): Stand`

- [ ] **Step 1: Write the failing test**

`packages/scoreformulier-logic/src/bereken-stand.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { berekenStand } from "./bereken-stand";
import type { SchotPoging, TegenDoelpunt } from "./types";

function maakPoging(resultaat: "raak" | "mis"): SchotPoging {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

function maakTegenDoelpunt(): TegenDoelpunt {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    verdedigerNaam: "Bram",
    helft: 1,
    minuut: 6,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

describe("berekenStand", () => {
  it("telt alleen raak mee voor eigen team", () => {
    const stand = berekenStand([maakPoging("raak"), maakPoging("mis"), maakPoging("raak")], []);
    expect(stand.eigen).toBe(2);
  });

  it("telt elk tegendoelpunt mee voor tegenstander", () => {
    const stand = berekenStand([], [maakTegenDoelpunt(), maakTegenDoelpunt()]);
    expect(stand.tegenstander).toBe(2);
  });

  it("geeft 0-0 zonder acties", () => {
    expect(berekenStand([], [])).toEqual({ eigen: 0, tegenstander: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: FAIL — `Cannot find module './bereken-stand'`

- [ ] **Step 3: Write minimal implementation**

`packages/scoreformulier-logic/src/bereken-stand.ts`:
```ts
import type { SchotPoging, TegenDoelpunt } from "./types";

export interface Stand {
  eigen: number;
  tegenstander: number;
}

export function berekenStand(schotpogingen: SchotPoging[], tegendoelpunten: TegenDoelpunt[]): Stand {
  return {
    eigen: schotpogingen.filter((poging) => poging.resultaat === "raak").length,
    tegenstander: tegendoelpunten.length,
  };
}
```

Add to `packages/scoreformulier-logic/src/index.ts`:
```ts
export * from "./types";
export * from "./bereken-stand";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/scoreformulier-logic
git commit -m "feat(scoreformulier-logic): add berekenStand"
```

---

### Task 3: `berekenSchotpercentages` — per speler, per scoretype

**Files:**
- Create: `packages/scoreformulier-logic/src/bereken-schotpercentages.ts`
- Test: `packages/scoreformulier-logic/src/bereken-schotpercentages.test.ts`
- Modify: `packages/scoreformulier-logic/src/index.ts`

**Interfaces:**
- Consumes: `SchotPoging`, `ScoreType` from `./types`
- Produces: `SchotStatistiek` (`{ pogingen: number; raak: number; percentage: number }`), `SpelerSchotStatistiek` (`SchotStatistiek & { schutterNaam: string; perScoreType: Record<ScoreType, SchotStatistiek> }`), `berekenSchotpercentages(schotpogingen: SchotPoging[]): SpelerSchotStatistiek[]`

- [ ] **Step 1: Write the failing test**

`packages/scoreformulier-logic/src/bereken-schotpercentages.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { berekenSchotpercentages } from "./bereken-schotpercentages";
import type { SchotPoging } from "./types";

function maakPoging(overrides: Partial<SchotPoging>): SchotPoging {
  return {
    id: crypto.randomUUID(),
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat: "raak",
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
    ...overrides,
  };
}

describe("berekenSchotpercentages", () => {
  it("groepeert per schutter", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna" }),
      maakPoging({ schutterNaam: "Bram" }),
    ]);
    expect(result.map((r) => r.schutterNaam).sort()).toEqual(["Anna", "Bram"]);
  });

  it("berekent totaalpercentage per speler", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", resultaat: "mis" }),
    ]);
    expect(result[0]).toMatchObject({ pogingen: 3, raak: 2, percentage: 67 });
  });

  it("berekent percentage per scoretype los", () => {
    const result = berekenSchotpercentages([
      maakPoging({ schutterNaam: "Anna", scoreType: "afstand", resultaat: "raak" }),
      maakPoging({ schutterNaam: "Anna", scoreType: "strafworp", resultaat: "mis" }),
    ]);
    expect(result[0]!.perScoreType.afstand).toEqual({ pogingen: 1, raak: 1, percentage: 100 });
    expect(result[0]!.perScoreType.strafworp).toEqual({ pogingen: 1, raak: 0, percentage: 0 });
    expect(result[0]!.perScoreType.doorloop).toEqual({ pogingen: 0, raak: 0, percentage: 0 });
  });

  it("geeft lege lijst zonder pogingen", () => {
    expect(berekenSchotpercentages([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: FAIL — `Cannot find module './bereken-schotpercentages'`

- [ ] **Step 3: Write minimal implementation**

`packages/scoreformulier-logic/src/bereken-schotpercentages.ts`:
```ts
import type { SchotPoging, ScoreType } from "./types";

export interface SchotStatistiek {
  pogingen: number;
  raak: number;
  percentage: number;
}

export interface SpelerSchotStatistiek extends SchotStatistiek {
  schutterNaam: string;
  perScoreType: Record<ScoreType, SchotStatistiek>;
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

function naarPercentage(raak: number, pogingen: number): number {
  return pogingen === 0 ? 0 : Math.round((raak / pogingen) * 100);
}

function berekenStatistiek(pogingen: SchotPoging[]): SchotStatistiek {
  const raak = pogingen.filter((poging) => poging.resultaat === "raak").length;
  return { pogingen: pogingen.length, raak, percentage: naarPercentage(raak, pogingen.length) };
}

export function berekenSchotpercentages(schotpogingen: SchotPoging[]): SpelerSchotStatistiek[] {
  const perSpeler = new Map<string, SchotPoging[]>();
  for (const poging of schotpogingen) {
    const bestaand = perSpeler.get(poging.schutterNaam) ?? [];
    bestaand.push(poging);
    perSpeler.set(poging.schutterNaam, bestaand);
  }

  return [...perSpeler.entries()].map(([schutterNaam, pogingen]) => {
    const perScoreType = Object.fromEntries(
      SCORE_TYPES.map((scoreType) => [
        scoreType,
        berekenStatistiek(pogingen.filter((poging) => poging.scoreType === scoreType)),
      ]),
    ) as Record<ScoreType, SchotStatistiek>;

    return { schutterNaam, ...berekenStatistiek(pogingen), perScoreType };
  });
}
```

Add to `packages/scoreformulier-logic/src/index.ts`:
```ts
export * from "./types";
export * from "./bereken-stand";
export * from "./bereken-schotpercentages";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: PASS (7 tests total)

- [ ] **Step 5: Commit**

```bash
git add packages/scoreformulier-logic
git commit -m "feat(scoreformulier-logic): add berekenSchotpercentages"
```

---

### Task 4: `matchReducer` — live wedstrijd-state

**Files:**
- Create: `packages/scoreformulier-logic/src/match-reducer.ts`
- Test: `packages/scoreformulier-logic/src/match-reducer.test.ts`
- Modify: `packages/scoreformulier-logic/src/index.ts`

**Interfaces:**
- Consumes: `Helft`, `SchotPoging`, `TegenDoelpunt` from `./types`
- Produces: `MatchState` (`{ huidigeHelft: Helft; helftGestart: boolean; schotpogingen: SchotPoging[]; tegendoelpunten: TegenDoelpunt[] }`), `MatchAction` (union below), `matchReducer(state: MatchState, action: MatchAction): MatchState`, `LEGE_MATCH_STATE: MatchState`

`MatchAction` union (exact — later tasks depend on these exact shapes):
```ts
| { type: "INIT"; state: MatchState }
| { type: "START_HELFT" }
| { type: "PAUZE_HELFT" }
| { type: "HELFTWISSEL" }
| { type: "ADD_SCHOTPOGING"; poging: SchotPoging }
| { type: "EDIT_SCHOTPOGING"; poging: SchotPoging }
| { type: "DELETE_SCHOTPOGING"; id: string }
| { type: "ADD_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
| { type: "EDIT_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
| { type: "DELETE_TEGENDOELPUNT"; id: string }
```

- [ ] **Step 1: Write the failing test**

`packages/scoreformulier-logic/src/match-reducer.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { LEGE_MATCH_STATE, matchReducer } from "./match-reducer";
import type { SchotPoging, TegenDoelpunt } from "./types";

function maakPoging(id: string): SchotPoging {
  return {
    id,
    wedstrijdId: "w1",
    schutterNaam: "Anna",
    helft: 1,
    minuut: 5,
    scoreType: "afstand",
    resultaat: "raak",
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

function maakDoelpunt(id: string): TegenDoelpunt {
  return {
    id,
    wedstrijdId: "w1",
    verdedigerNaam: "Bram",
    helft: 1,
    minuut: 6,
    aangemaaktOp: "2026-07-10T10:00:00.000Z",
    gewijzigdOp: "2026-07-10T10:00:00.000Z",
  };
}

describe("matchReducer", () => {
  it("INIT vervangt de volledige state", () => {
    const nieuweState = { ...LEGE_MATCH_STATE, huidigeHelft: 2 as const };
    expect(matchReducer(LEGE_MATCH_STATE, { type: "INIT", state: nieuweState })).toEqual(nieuweState);
  });

  it("START_HELFT en PAUZE_HELFT togglen helftGestart", () => {
    const gestart = matchReducer(LEGE_MATCH_STATE, { type: "START_HELFT" });
    expect(gestart.helftGestart).toBe(true);
    expect(matchReducer(gestart, { type: "PAUZE_HELFT" }).helftGestart).toBe(false);
  });

  it("HELFTWISSEL wisselt helft en zet helftGestart uit", () => {
    const gestart = matchReducer(LEGE_MATCH_STATE, { type: "START_HELFT" });
    const gewisseld = matchReducer(gestart, { type: "HELFTWISSEL" });
    expect(gewisseld.huidigeHelft).toBe(2);
    expect(gewisseld.helftGestart).toBe(false);
  });

  it("ADD_SCHOTPOGING voegt toe zonder bestaande te muteren", () => {
    const state = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    expect(state.schotpogingen).toHaveLength(1);
    expect(LEGE_MATCH_STATE.schotpogingen).toHaveLength(0);
  });

  it("EDIT_SCHOTPOGING vervangt de poging met matchend id", () => {
    const metPoging = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    const gewijzigd = matchReducer(metPoging, {
      type: "EDIT_SCHOTPOGING",
      poging: { ...maakPoging("p1"), resultaat: "mis" },
    });
    expect(gewijzigd.schotpogingen[0]!.resultaat).toBe("mis");
  });

  it("DELETE_SCHOTPOGING verwijdert op id", () => {
    const metPoging = matchReducer(LEGE_MATCH_STATE, { type: "ADD_SCHOTPOGING", poging: maakPoging("p1") });
    const verwijderd = matchReducer(metPoging, { type: "DELETE_SCHOTPOGING", id: "p1" });
    expect(verwijderd.schotpogingen).toHaveLength(0);
  });

  it("ADD_/EDIT_/DELETE_TEGENDOELPUNT werken hetzelfde", () => {
    const metDoelpunt = matchReducer(LEGE_MATCH_STATE, { type: "ADD_TEGENDOELPUNT", doelpunt: maakDoelpunt("d1") });
    expect(metDoelpunt.tegendoelpunten).toHaveLength(1);
    const gewijzigd = matchReducer(metDoelpunt, {
      type: "EDIT_TEGENDOELPUNT",
      doelpunt: { ...maakDoelpunt("d1"), verdedigerNaam: "Chris" },
    });
    expect(gewijzigd.tegendoelpunten[0]!.verdedigerNaam).toBe("Chris");
    const verwijderd = matchReducer(gewijzigd, { type: "DELETE_TEGENDOELPUNT", id: "d1" });
    expect(verwijderd.tegendoelpunten).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: FAIL — `Cannot find module './match-reducer'`

- [ ] **Step 3: Write minimal implementation**

`packages/scoreformulier-logic/src/match-reducer.ts`:
```ts
import type { Helft, SchotPoging, TegenDoelpunt } from "./types";

export interface MatchState {
  huidigeHelft: Helft;
  helftGestart: boolean;
  schotpogingen: SchotPoging[];
  tegendoelpunten: TegenDoelpunt[];
}

export const LEGE_MATCH_STATE: MatchState = {
  huidigeHelft: 1,
  helftGestart: false,
  schotpogingen: [],
  tegendoelpunten: [],
};

export type MatchAction =
  | { type: "INIT"; state: MatchState }
  | { type: "START_HELFT" }
  | { type: "PAUZE_HELFT" }
  | { type: "HELFTWISSEL" }
  | { type: "ADD_SCHOTPOGING"; poging: SchotPoging }
  | { type: "EDIT_SCHOTPOGING"; poging: SchotPoging }
  | { type: "DELETE_SCHOTPOGING"; id: string }
  | { type: "ADD_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
  | { type: "EDIT_TEGENDOELPUNT"; doelpunt: TegenDoelpunt }
  | { type: "DELETE_TEGENDOELPUNT"; id: string };

export function matchReducer(state: MatchState, action: MatchAction): MatchState {
  switch (action.type) {
    case "INIT":
      return action.state;
    case "START_HELFT":
      return { ...state, helftGestart: true };
    case "PAUZE_HELFT":
      return { ...state, helftGestart: false };
    case "HELFTWISSEL":
      return { ...state, huidigeHelft: state.huidigeHelft === 1 ? 2 : 1, helftGestart: false };
    case "ADD_SCHOTPOGING":
      return { ...state, schotpogingen: [...state.schotpogingen, action.poging] };
    case "EDIT_SCHOTPOGING":
      return {
        ...state,
        schotpogingen: state.schotpogingen.map((poging) =>
          poging.id === action.poging.id ? action.poging : poging,
        ),
      };
    case "DELETE_SCHOTPOGING":
      return { ...state, schotpogingen: state.schotpogingen.filter((poging) => poging.id !== action.id) };
    case "ADD_TEGENDOELPUNT":
      return { ...state, tegendoelpunten: [...state.tegendoelpunten, action.doelpunt] };
    case "EDIT_TEGENDOELPUNT":
      return {
        ...state,
        tegendoelpunten: state.tegendoelpunten.map((doelpunt) =>
          doelpunt.id === action.doelpunt.id ? action.doelpunt : doelpunt,
        ),
      };
    case "DELETE_TEGENDOELPUNT":
      return {
        ...state,
        tegendoelpunten: state.tegendoelpunten.filter((doelpunt) => doelpunt.id !== action.id),
      };
  }
}
```

Add to `packages/scoreformulier-logic/src/index.ts`:
```ts
export * from "./types";
export * from "./bereken-stand";
export * from "./bereken-schotpercentages";
export * from "./match-reducer";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: PASS (14 tests total)

Run: `pnpm --filter @korfbaltools/scoreformulier-logic typecheck && pnpm --filter @korfbaltools/scoreformulier-logic lint`
Expected: both pass clean.

- [ ] **Step 5: Commit**

```bash
git add packages/scoreformulier-logic
git commit -m "feat(scoreformulier-logic): add matchReducer"
```

---

### Task 5: Scaffold `apps/scoreformulier` Next.js app + wire into `apps/main`

**Files:**
- Create: `apps/scoreformulier/package.json`
- Create: `apps/scoreformulier/next.config.mjs`
- Create: `apps/scoreformulier/tsconfig.json`
- Create: `apps/scoreformulier/eslint.config.mjs`
- Create: `apps/scoreformulier/postcss.config.mjs`
- Create: `apps/scoreformulier/tailwind.config.ts`
- Create: `apps/scoreformulier/src/app/layout.tsx`
- Create: `apps/scoreformulier/src/app/globals.css`
- Create: `apps/scoreformulier/src/app/page.tsx`
- Modify: `apps/main/next.config.mjs`

**Interfaces:**
- Produces: a running app on port 3004, reachable standalone and (once `SCOREFORMULIER_APP_URL` is set) proxied under `/scoreformulier` by `apps/main`.

- [ ] **Step 1: Create the package manifest**

`apps/scoreformulier/package.json`:
```json
{
  "name": "@korfbaltools/scoreformulier",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev --port 3004",
    "build": "next build",
    "start": "next start --port 3004",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@korfbaltools/scoreformulier-logic": "workspace:*",
    "@korfbaltools/ui": "workspace:*",
    "idb": "^8.0.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@korfbaltools/config": "workspace:*",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "postcss": "^8.5.15",
    "tailwindcss": "^3.4.19",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create Next/TS/lint/Tailwind config**

`apps/scoreformulier/next.config.mjs`:
```js
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-zone setup (apps/main rewrites /scoreformulier/* here) — without a
  // basePath, this app's /_next/static/* asset URLs collide with apps/main's.
  // https://nextjs.org/docs/app/guides/multi-zones
  basePath: "/scoreformulier",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/scoreformulier-logic", "@korfbaltools/config", "@korfbaltools/ui"],
};

export default nextConfig;
```

`apps/scoreformulier/tsconfig.json`:
```json
{
  "extends": "@korfbaltools/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    },
    "allowJs": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`apps/scoreformulier/eslint.config.mjs`:
```js
import { baseConfig } from "@korfbaltools/config/eslint";

export default [...baseConfig, { ignores: [".next/**", "next-env.d.ts"] }];
```

`apps/scoreformulier/postcss.config.mjs`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`apps/scoreformulier/tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
import brandPreset from "@korfbaltools/config/tailwind/preset";

const config: Config = {
  presets: [brandPreset],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Create app shell**

`apps/scoreformulier/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-optical-sizing: auto;
  }
}
```

`apps/scoreformulier/src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Footer } from "@korfbaltools/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scoreformulier",
  description: "Live scoreverloop bijhouden tijdens een wedstrijd voor Korfbaltools.nl",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-white flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
```

`apps/scoreformulier/src/app/page.tsx`:
```tsx
import { Container } from "@korfbaltools/ui";

export default function HomePage() {
  return (
    <main className="py-10">
      <Container>
        <h1 className="text-2xl font-semibold text-neutral-900">Scoreformulier</h1>
      </Container>
    </main>
  );
}
```

Note: no `getCurrentUser`/`KorfbalToolBar`/auth wiring here — spec says no login/rollen for this MVP, unlike `apps/vastspelen`.

- [ ] **Step 4: Wire the multi-zone rewrite into `apps/main`**

In `apps/main/next.config.mjs`, add a new block inside `rewrites()`, right after the existing `vastspelenAppUrl` block (before `return rewrites;`):
```js
    // Local dev: proxy /scoreformulier/* to apps/scoreformulier instead of the production
    // scoreformulier.vercel.app deployment.
    const scoreformulierAppUrl = process.env.SCOREFORMULIER_APP_URL;
    if (scoreformulierAppUrl) {
      rewrites.push({
        // apps/scoreformulier has basePath: "/scoreformulier" (see its next.config.mjs), so it
        // already expects requests prefixed with /scoreformulier — pass it through as-is.
        source: "/scoreformulier/:path*",
        destination: `${scoreformulierAppUrl}/scoreformulier/:path*`,
      });
    }
```

Tell the user (do not edit `.env`/`.env.local` yourself): add `SCOREFORMULIER_APP_URL=http://localhost:3004` to their local env file if they want the `/scoreformulier` proxy to work from `apps/main` during local dev.

- [ ] **Step 5: Install and smoke test**

Run: `pnpm install`
Expected: no errors, `apps/scoreformulier` shows up as a workspace package.

Run: `pnpm --filter @korfbaltools/scoreformulier typecheck`
Expected: passes.

Run: `pnpm --filter @korfbaltools/scoreformulier dev`
Expected: server starts on port 3004. Open `http://localhost:3004/scoreformulier` in a browser — page shows "Scoreformulier" heading and the shared footer, no console errors. Stop the server after checking.

- [ ] **Step 6: Commit**

```bash
git add apps/scoreformulier apps/main/next.config.mjs
git commit -m "feat(scoreformulier): scaffold Next.js app and wire multi-zone rewrite"
```

---

### Task 6: `lib/db.ts` — IndexedDB wrapper

**Files:**
- Create: `apps/scoreformulier/src/lib/db.ts`

**Interfaces:**
- Consumes: `SchotPoging`, `TegenDoelpunt`, `Wedstrijd` from `@korfbaltools/scoreformulier-logic`
- Produces: `listWedstrijden(): Promise<Wedstrijd[]>`, `getWedstrijd(id: string): Promise<Wedstrijd | undefined>`, `saveWedstrijd(wedstrijd: Wedstrijd): Promise<void>`, `patchWedstrijd(id: string, patch: Partial<Wedstrijd>): Promise<void>`, `listSchotpogingen(wedstrijdId: string): Promise<SchotPoging[]>`, `saveSchotPoging(poging: SchotPoging): Promise<void>`, `deleteSchotPoging(id: string): Promise<void>`, `listTegendoelpunten(wedstrijdId: string): Promise<TegenDoelpunt[]>`, `saveTegenDoelpunt(doelpunt: TegenDoelpunt): Promise<void>`, `deleteTegenDoelpunt(id: string): Promise<void>`

Not unit-tested (browser-only IndexedDB API — see Global Constraints). Verified via the manual smoke test in Step 2.

- [ ] **Step 1: Write the wrapper**

`apps/scoreformulier/src/lib/db.ts`:
```ts
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { SchotPoging, TegenDoelpunt, Wedstrijd } from "@korfbaltools/scoreformulier-logic";

interface ScoreformulierDB extends DBSchema {
  wedstrijden: {
    key: string;
    value: Wedstrijd;
  };
  schotpogingen: {
    key: string;
    value: SchotPoging;
    indexes: { wedstrijdId: string };
  };
  tegendoelpunten: {
    key: string;
    value: TegenDoelpunt;
    indexes: { wedstrijdId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<ScoreformulierDB>> | null = null;

function getDb(): Promise<IDBPDatabase<ScoreformulierDB>> {
  dbPromise ??= openDB<ScoreformulierDB>("scoreformulier", 1, {
    upgrade(db) {
      db.createObjectStore("wedstrijden", { keyPath: "id" });
      const schotpogingen = db.createObjectStore("schotpogingen", { keyPath: "id" });
      schotpogingen.createIndex("wedstrijdId", "wedstrijdId");
      const tegendoelpunten = db.createObjectStore("tegendoelpunten", { keyPath: "id" });
      tegendoelpunten.createIndex("wedstrijdId", "wedstrijdId");
    },
  });
  return dbPromise;
}

export async function listWedstrijden(): Promise<Wedstrijd[]> {
  const db = await getDb();
  return db.getAll("wedstrijden");
}

export async function getWedstrijd(id: string): Promise<Wedstrijd | undefined> {
  const db = await getDb();
  return db.get("wedstrijden", id);
}

export async function saveWedstrijd(wedstrijd: Wedstrijd): Promise<void> {
  const db = await getDb();
  await db.put("wedstrijden", wedstrijd);
}

export async function patchWedstrijd(id: string, patch: Partial<Wedstrijd>): Promise<void> {
  const db = await getDb();
  const bestaand = await db.get("wedstrijden", id);
  if (!bestaand) return;
  await db.put("wedstrijden", { ...bestaand, ...patch });
}

export async function listSchotpogingen(wedstrijdId: string): Promise<SchotPoging[]> {
  const db = await getDb();
  return db.getAllFromIndex("schotpogingen", "wedstrijdId", wedstrijdId);
}

export async function saveSchotPoging(poging: SchotPoging): Promise<void> {
  const db = await getDb();
  await db.put("schotpogingen", poging);
}

export async function deleteSchotPoging(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("schotpogingen", id);
}

export async function listTegendoelpunten(wedstrijdId: string): Promise<TegenDoelpunt[]> {
  const db = await getDb();
  return db.getAllFromIndex("tegendoelpunten", "wedstrijdId", wedstrijdId);
}

export async function saveTegenDoelpunt(doelpunt: TegenDoelpunt): Promise<void> {
  const db = await getDb();
  await db.put("tegendoelpunten", doelpunt);
}

export async function deleteTegenDoelpunt(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("tegendoelpunten", id);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @korfbaltools/scoreformulier typecheck`
Expected: passes. (Full manual browser verification of this file happens in Task 8's smoke test, once `MatchStartForm` actually calls `saveWedstrijd`/`listWedstrijden`.)

- [ ] **Step 3: Commit**

```bash
git add apps/scoreformulier/src/lib/db.ts
git commit -m "feat(scoreformulier): add IndexedDB wrapper"
```

---

### Task 7: `lib/use-match.ts` — live match hook

**Files:**
- Create: `apps/scoreformulier/src/lib/use-match.ts`

**Interfaces:**
- Consumes: `matchReducer`, `LEGE_MATCH_STATE`, `MatchState`, `SchotPoging`, `TegenDoelpunt`, `Wedstrijd` from `@korfbaltools/scoreformulier-logic`; `getWedstrijd`, `listSchotpogingen`, `listTegendoelpunten`, `saveWedstrijd`, `patchWedstrijd`, `saveSchotPoging`, `deleteSchotPoging`, `saveTegenDoelpunt`, `deleteTegenDoelpunt` from `./db`
- Produces: `useMatch(wedstrijdId: string)` returning `{ wedstrijd: Wedstrijd | null; state: MatchState; geladen: boolean; startHelft(): Promise<void>; pauzeHelft(): Promise<void>; helftwissel(): Promise<void>; voegSchotPogingToe(poging: SchotPoging): Promise<void>; wijzigSchotPoging(poging: SchotPoging): Promise<void>; verwijderSchotPoging(id: string): Promise<void>; voegTegenDoelpuntToe(doelpunt: TegenDoelpunt): Promise<void>; wijzigTegenDoelpunt(doelpunt: TegenDoelpunt): Promise<void>; verwijderTegenDoelpunt(id: string): Promise<void>; rondAf(): Promise<void> }`

- [ ] **Step 1: Write the hook**

`apps/scoreformulier/src/lib/use-match.ts`:
```ts
"use client";

import { useEffect, useReducer, useState } from "react";
import {
  LEGE_MATCH_STATE,
  matchReducer,
  type SchotPoging,
  type TegenDoelpunt,
  type Wedstrijd,
} from "@korfbaltools/scoreformulier-logic";
import {
  deleteSchotPoging,
  deleteTegenDoelpunt,
  getWedstrijd,
  listSchotpogingen,
  listTegendoelpunten,
  patchWedstrijd,
  saveSchotPoging,
  saveTegenDoelpunt,
  saveWedstrijd,
} from "./db";

export function useMatch(wedstrijdId: string) {
  const [state, dispatch] = useReducer(matchReducer, LEGE_MATCH_STATE);
  const [wedstrijd, setWedstrijd] = useState<Wedstrijd | null>(null);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    let actief = true;
    void (async () => {
      const [geladenWedstrijd, schotpogingen, tegendoelpunten] = await Promise.all([
        getWedstrijd(wedstrijdId),
        listSchotpogingen(wedstrijdId),
        listTegendoelpunten(wedstrijdId),
      ]);
      if (!actief || !geladenWedstrijd) return;
      dispatch({
        type: "INIT",
        state: {
          huidigeHelft: geladenWedstrijd.huidigeHelft,
          helftGestart: geladenWedstrijd.helftGestart,
          schotpogingen,
          tegendoelpunten,
        },
      });
      setWedstrijd(geladenWedstrijd);
      setGeladen(true);
    })();
    return () => {
      actief = false;
    };
  }, [wedstrijdId]);

  async function startHelft() {
    dispatch({ type: "START_HELFT" });
    await patchWedstrijd(wedstrijdId, { helftGestart: true });
  }

  async function pauzeHelft() {
    dispatch({ type: "PAUZE_HELFT" });
    await patchWedstrijd(wedstrijdId, { helftGestart: false });
  }

  async function helftwissel() {
    const volgendeHelft = state.huidigeHelft === 1 ? 2 : 1;
    dispatch({ type: "HELFTWISSEL" });
    await patchWedstrijd(wedstrijdId, { huidigeHelft: volgendeHelft, helftGestart: false });
  }

  async function voegSchotPogingToe(poging: SchotPoging) {
    dispatch({ type: "ADD_SCHOTPOGING", poging });
    await saveSchotPoging(poging);
  }

  async function wijzigSchotPoging(poging: SchotPoging) {
    dispatch({ type: "EDIT_SCHOTPOGING", poging });
    await saveSchotPoging(poging);
  }

  async function verwijderSchotPoging(id: string) {
    dispatch({ type: "DELETE_SCHOTPOGING", id });
    await deleteSchotPoging(id);
  }

  async function voegTegenDoelpuntToe(doelpunt: TegenDoelpunt) {
    dispatch({ type: "ADD_TEGENDOELPUNT", doelpunt });
    await saveTegenDoelpunt(doelpunt);
  }

  async function wijzigTegenDoelpunt(doelpunt: TegenDoelpunt) {
    dispatch({ type: "EDIT_TEGENDOELPUNT", doelpunt });
    await saveTegenDoelpunt(doelpunt);
  }

  async function verwijderTegenDoelpunt(id: string) {
    dispatch({ type: "DELETE_TEGENDOELPUNT", id });
    await deleteTegenDoelpunt(id);
  }

  async function rondAf() {
    if (!wedstrijd) return;
    const bijgewerkt: Wedstrijd = { ...wedstrijd, status: "afgerond" };
    await saveWedstrijd(bijgewerkt);
    setWedstrijd(bijgewerkt);
  }

  return {
    wedstrijd,
    state,
    geladen,
    startHelft,
    pauzeHelft,
    helftwissel,
    voegSchotPogingToe,
    wijzigSchotPoging,
    verwijderSchotPoging,
    voegTegenDoelpuntToe,
    wijzigTegenDoelpunt,
    verwijderTegenDoelpunt,
    rondAf,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @korfbaltools/scoreformulier typecheck`
Expected: passes. (Behavior verified in Task 10's manual smoke test, once a screen actually calls `useMatch`.)

- [ ] **Step 3: Commit**

```bash
git add apps/scoreformulier/src/lib/use-match.ts
git commit -m "feat(scoreformulier): add useMatch hook"
```

---

### Task 8: Wedstrijd starten — `MatchStartForm` + home page

**Files:**
- Create: `apps/scoreformulier/src/components/MatchStartForm.tsx`
- Modify: `apps/scoreformulier/src/app/page.tsx`

**Interfaces:**
- Consumes: `Wedstrijd` from `@korfbaltools/scoreformulier-logic`; `listWedstrijden`, `saveWedstrijd` from `@/lib/db`
- Produces: `<MatchStartForm />` component, navigates to `/wedstrijd/[id]` on submit.

- [ ] **Step 1: Write the component**

`apps/scoreformulier/src/components/MatchStartForm.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Wedstrijd } from "@korfbaltools/scoreformulier-logic";
import { listWedstrijden, saveWedstrijd } from "@/lib/db";

function vandaag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MatchStartForm() {
  const router = useRouter();
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [datum, setDatum] = useState(vandaag());
  const [tegenstander, setTegenstander] = useState("");
  const [teamNamenTekst, setTeamNamenTekst] = useState("");

  useEffect(() => {
    void listWedstrijden().then(setWedstrijden);
  }, []);

  async function start() {
    const teamNamen = teamNamenTekst
      .split(",")
      .map((naam) => naam.trim())
      .filter((naam) => naam.length > 0);

    const wedstrijd: Wedstrijd = {
      id: crypto.randomUUID(),
      datum,
      tegenstander: tegenstander.trim() || null,
      teamNamen,
      status: "bezig",
      huidigeHelft: 1,
      helftGestart: false,
    };
    await saveWedstrijd(wedstrijd);
    router.push(`/wedstrijd/${wedstrijd.id}`);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Nieuwe wedstrijd</h2>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Datum
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Tegenstander (optioneel)
          <input
            type="text"
            value={tegenstander}
            onChange={(e) => setTegenstander(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Teamnamen (komma-gescheiden)
          <input
            type="text"
            value={teamNamenTekst}
            onChange={(e) => setTeamNamenTekst(e.target.value)}
            placeholder="Anna, Bram, Chris, ..."
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void start()}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Wedstrijd starten
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">Eerdere wedstrijden</h2>
        {wedstrijden.length === 0 ? (
          <p className="text-sm text-neutral-500">Nog geen wedstrijden.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {wedstrijden.map((wedstrijd) => (
              <li key={wedstrijd.id} className="py-2">
                <a href={`/wedstrijd/${wedstrijd.id}`} className="text-primary hover:underline">
                  {wedstrijd.datum} {wedstrijd.tegenstander ? `vs ${wedstrijd.tegenstander}` : ""} — {wedstrijd.status}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the home page**

`apps/scoreformulier/src/app/page.tsx`:
```tsx
import { Container } from "@korfbaltools/ui";
import { MatchStartForm } from "@/components/MatchStartForm";

export default function HomePage() {
  return (
    <main className="py-10">
      <Container>
        <h1 className="text-2xl font-semibold text-neutral-900">Scoreformulier</h1>
        <MatchStartForm />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Manual smoke test**

Run: `pnpm --filter @korfbaltools/scoreformulier dev`

In the browser at `http://localhost:3004/scoreformulier`:
1. Fill in datum (default today), tegenstander "De Testers", teamnamen "Anna, Bram, Chris".
2. Click "Wedstrijd starten" — expect a redirect to `/scoreformulier/wedstrijd/<uuid>` (page will 404 until Task 10 — that's expected for now).
3. Go back to `http://localhost:3004/scoreformulier` — expect "Eerdere wedstrijden" to list the just-created match with status "bezig".
4. Open browser devtools → Application → IndexedDB → `scoreformulier` → `wedstrijden` — expect one record with the entered fields.

Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add apps/scoreformulier/src/components/MatchStartForm.tsx apps/scoreformulier/src/app/page.tsx
git commit -m "feat(scoreformulier): add match start form"
```

---

### Task 9: `Modal`, `ShotForm`, `ConcedeForm`

**Files:**
- Create: `apps/scoreformulier/src/components/Modal.tsx`
- Create: `apps/scoreformulier/src/components/ShotForm.tsx`
- Create: `apps/scoreformulier/src/components/ConcedeForm.tsx`

**Interfaces:**
- Produces: `<Modal titleId={string} onClose={() => void} className?={string}>` (portal + focus trap + Escape-to-close, same pattern as `apps/teamindeling/src/components/Modal.tsx`), `<ShotForm teamNamen={string[]} onSubmit={(input: { schutterNaam: string; scoreType: ScoreType; resultaat: SchotResultaat }) => void} onClose={() => void}>`, `<ConcedeForm onSubmit={(verdedigerNaam: string) => void} onClose={() => void}>`

- [ ] **Step 1: Create the Modal shell**

`apps/scoreformulier/src/components/Modal.tsx` (same focus-trap/portal pattern as `apps/teamindeling/src/components/Modal.tsx`):
```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ titleId, onClose, children, className = "" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(document.activeElement);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previousFocusRef.current as HTMLElement | null)?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white rounded-xl shadow-lg max-w-[calc(100vw-2rem)] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 2: Create ShotForm**

`apps/scoreformulier/src/components/ShotForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { ScoreType, SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { Modal } from "./Modal";

interface ShotFormProps {
  teamNamen: string[];
  onSubmit: (input: { schutterNaam: string; scoreType: ScoreType; resultaat: SchotResultaat }) => void;
  onClose: () => void;
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

export function ShotForm({ teamNamen, onSubmit, onClose }: ShotFormProps) {
  const [schutterNaam, setSchutterNaam] = useState(teamNamen[0] ?? "");
  const [andereSchutter, setAndereSchutter] = useState("");
  const [gebruikAndere, setGebruikAndere] = useState(teamNamen.length === 0);
  const [scoreType, setScoreType] = useState<ScoreType>("afstand");

  function kiesResultaat(resultaat: SchotResultaat) {
    const naam = gebruikAndere ? andereSchutter.trim() : schutterNaam;
    if (naam.length === 0) return;
    onSubmit({ schutterNaam: naam, scoreType, resultaat });
    onClose();
  }

  return (
    <Modal titleId="shot-form-title" onClose={onClose} className="p-6">
      <h2 id="shot-form-title" className="text-lg font-semibold text-neutral-900">
        Schotpoging
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-sm text-neutral-700">
          Schutter
          {gebruikAndere ? (
            <input
              type="text"
              autoFocus
              value={andereSchutter}
              onChange={(e) => setAndereSchutter(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          ) : (
            <select
              value={schutterNaam}
              onChange={(e) => setSchutterNaam(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {teamNamen.map((naam) => (
                <option key={naam} value={naam}>
                  {naam}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="self-start text-xs text-primary hover:underline"
            onClick={() => setGebruikAndere((v) => !v)}
          >
            {gebruikAndere ? "Kies uit lijst" : "Anders..."}
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Scoretype
          <select
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value as ScoreType)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          >
            {SCORE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => kiesResultaat("raak")}
            className="flex-1 rounded-md bg-primary px-4 py-3 text-white hover:bg-primary-600"
          >
            Raak
          </button>
          <button
            type="button"
            onClick={() => kiesResultaat("mis")}
            className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-neutral-900 hover:bg-neutral-50"
          >
            Mis
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Create ConcedeForm**

`apps/scoreformulier/src/components/ConcedeForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Modal } from "./Modal";

interface ConcedeFormProps {
  onSubmit: (verdedigerNaam: string) => void;
  onClose: () => void;
}

export function ConcedeForm({ onSubmit, onClose }: ConcedeFormProps) {
  const [verdedigerNaam, setVerdedigerNaam] = useState("");

  function bevestig() {
    const naam = verdedigerNaam.trim();
    if (naam.length === 0) return;
    onSubmit(naam);
    onClose();
  }

  return (
    <Modal titleId="concede-form-title" onClose={onClose} className="p-6">
      <h2 id="concede-form-title" className="text-lg font-semibold text-neutral-900">
        Tegendoelpunt
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Verdediger gepasseerd
          <input
            type="text"
            autoFocus
            value={verdedigerNaam}
            onChange={(e) => setVerdedigerNaam(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={bevestig}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Vastleggen
        </button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @korfbaltools/scoreformulier typecheck`
Expected: passes. (Rendered and exercised in Task 10's manual smoke test.)

- [ ] **Step 5: Commit**

```bash
git add apps/scoreformulier/src/components/Modal.tsx apps/scoreformulier/src/components/ShotForm.tsx apps/scoreformulier/src/components/ConcedeForm.tsx
git commit -m "feat(scoreformulier): add Modal, ShotForm, ConcedeForm"
```

---

### Task 10: Live invoerscherm — `LiveMatchScreen` + `/wedstrijd/[id]`

**Files:**
- Create: `apps/scoreformulier/src/components/LiveMatchScreen.tsx`
- Create: `apps/scoreformulier/src/app/wedstrijd/[id]/page.tsx`

**Interfaces:**
- Consumes: `useMatch` from `@/lib/use-match`; `berekenStand` from `@korfbaltools/scoreformulier-logic`; `ShotForm`, `ConcedeForm` from `@/components/*`
- Produces: `<LiveMatchScreen wedstrijdId={string} />`, route `/wedstrijd/[id]`

- [ ] **Step 1: Write LiveMatchScreen**

`apps/scoreformulier/src/components/LiveMatchScreen.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { berekenStand, type ScoreType, type SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { useMatch } from "@/lib/use-match";
import { ShotForm } from "./ShotForm";
import { ConcedeForm } from "./ConcedeForm";

interface LiveMatchScreenProps {
  wedstrijdId: string;
}

export function LiveMatchScreen({ wedstrijdId }: LiveMatchScreenProps) {
  const {
    wedstrijd,
    state,
    geladen,
    startHelft,
    pauzeHelft,
    helftwissel,
    voegSchotPogingToe,
    voegTegenDoelpuntToe,
    rondAf,
  } = useMatch(wedstrijdId);
  const [toonSchotForm, setToonSchotForm] = useState(false);
  const [toonTegenForm, setToonTegenForm] = useState(false);
  const [, forceerHerrender] = useState(0);
  const helftStartTijdstip = useRef<number | null>(null);
  const minuutBijPauze = useRef(0);

  useEffect(() => {
    if (!state.helftGestart) return;
    helftStartTijdstip.current = Date.now();
    const interval = setInterval(() => forceerHerrender((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [state.helftGestart]);

  function huidigeMinuut(): number {
    if (!state.helftGestart || helftStartTijdstip.current === null) return minuutBijPauze.current;
    return minuutBijPauze.current + Math.floor((Date.now() - helftStartTijdstip.current) / 60000);
  }

  function schakelStopwatch() {
    if (state.helftGestart) {
      minuutBijPauze.current = huidigeMinuut();
      void pauzeHelft();
    } else {
      void startHelft();
    }
  }

  function wisselHelft() {
    minuutBijPauze.current = 0;
    void helftwissel();
  }

  function loggSchotPoging(input: { schutterNaam: string; scoreType: ScoreType; resultaat: SchotResultaat }) {
    void voegSchotPogingToe({
      id: crypto.randomUUID(),
      wedstrijdId,
      schutterNaam: input.schutterNaam,
      helft: state.huidigeHelft,
      minuut: huidigeMinuut(),
      scoreType: input.scoreType,
      resultaat: input.resultaat,
      aangemaaktOp: new Date().toISOString(),
      gewijzigdOp: new Date().toISOString(),
    });
  }

  function loggTegenDoelpunt(verdedigerNaam: string) {
    void voegTegenDoelpuntToe({
      id: crypto.randomUUID(),
      wedstrijdId,
      verdedigerNaam,
      helft: state.huidigeHelft,
      minuut: huidigeMinuut(),
      aangemaaktOp: new Date().toISOString(),
      gewijzigdOp: new Date().toISOString(),
    });
  }

  if (!geladen || !wedstrijd) {
    return <p className="text-sm text-neutral-500">Laden...</p>;
  }

  const stand = berekenStand(state.schotpogingen, state.tegendoelpunten);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-5">
        <div className="text-3xl font-bold text-neutral-900">
          {stand.eigen} - {stand.tegenstander}
        </div>
        <div className="text-sm text-neutral-600">
          Helft {state.huidigeHelft} · minuut {huidigeMinuut()}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={schakelStopwatch}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          {state.helftGestart ? "Pauze" : "Start helft"}
        </button>
        <button
          type="button"
          onClick={wisselHelft}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          Helftwissel
        </button>
        <button
          type="button"
          onClick={() => setToonSchotForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Schotpoging
        </button>
        <button
          type="button"
          onClick={() => setToonTegenForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Tegendoelpunt
        </button>
        <a
          href={`/wedstrijd/${wedstrijdId}/log`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          Log bekijken
        </a>
        <button
          type="button"
          onClick={() => void rondAf()}
          className="rounded-md bg-danger px-4 py-2 text-white hover:opacity-90"
        >
          Wedstrijd afronden
        </button>
      </div>

      {toonSchotForm && (
        <ShotForm teamNamen={wedstrijd.teamNamen} onSubmit={loggSchotPoging} onClose={() => setToonSchotForm(false)} />
      )}
      {toonTegenForm && <ConcedeForm onSubmit={loggTegenDoelpunt} onClose={() => setToonTegenForm(false)} />}
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

`apps/scoreformulier/src/app/wedstrijd/[id]/page.tsx`:
```tsx
import { Container } from "@korfbaltools/ui";
import { LiveMatchScreen } from "@/components/LiveMatchScreen";

export default async function WedstrijdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="py-10">
      <Container>
        <LiveMatchScreen wedstrijdId={id} />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Manual smoke test**

Run: `pnpm --filter @korfbaltools/scoreformulier dev`

In the browser:
1. Go to `http://localhost:3004/scoreformulier`, start a new match with teamnamen "Anna, Bram".
2. On the live screen: click "Start helft" — minuut should tick up every ~60s (or just verify the button toggles to "Pauze" and no console errors appear; don't wait a full minute).
3. Click "Schotpoging" → pick "Anna" → "afstand" → "Raak" — stand should update to `1 - 0`.
4. Click "Schotpoging" → "Anders..." → type "Diana" → "doorloop" → "Mis" — stand stays `1 - 0`.
5. Click "Tegendoelpunt" → type "Verdediger X" → "Vastleggen" — stand updates to `1 - 1`.
6. Click "Helftwissel" — "Helft 2" should show, minuut resets to 0.
7. Reload the page — stand, helft, and all logged actions should persist (confirms IndexedDB round-trip through `useMatch`).
8. Click "Wedstrijd afronden" — no crash (log/list verified in later tasks).

Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add apps/scoreformulier/src/components/LiveMatchScreen.tsx apps/scoreformulier/src/app/wedstrijd
git commit -m "feat(scoreformulier): add live match screen"
```

---

### Task 11: Log-scherm — `MatchLog` + `/wedstrijd/[id]/log`

**Files:**
- Create: `apps/scoreformulier/src/components/MatchLog.tsx`
- Create: `apps/scoreformulier/src/app/wedstrijd/[id]/log/page.tsx`

**Interfaces:**
- Consumes: `useMatch` from `@/lib/use-match`; `SchotPoging`, `TegenDoelpunt`, `ScoreType`, `SchotResultaat` from `@korfbaltools/scoreformulier-logic`
- Produces: `<MatchLog wedstrijdId={string} />`, route `/wedstrijd/[id]/log`

- [ ] **Step 1: Write MatchLog**

`apps/scoreformulier/src/components/MatchLog.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { SchotPoging, TegenDoelpunt, ScoreType, SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { useMatch } from "@/lib/use-match";

interface MatchLogProps {
  wedstrijdId: string;
}

type LogRegel = { soort: "schotpoging"; item: SchotPoging } | { soort: "tegendoelpunt"; item: TegenDoelpunt };

function naarLogRegels(schotpogingen: SchotPoging[], tegendoelpunten: TegenDoelpunt[]): LogRegel[] {
  const regels: LogRegel[] = [
    ...schotpogingen.map((item) => ({ soort: "schotpoging" as const, item })),
    ...tegendoelpunten.map((item) => ({ soort: "tegendoelpunt" as const, item })),
  ];
  return regels.sort((a, b) => a.item.helft - b.item.helft || a.item.minuut - b.item.minuut);
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

export function MatchLog({ wedstrijdId }: MatchLogProps) {
  const { state, geladen, wijzigSchotPoging, verwijderSchotPoging, wijzigTegenDoelpunt, verwijderTegenDoelpunt } =
    useMatch(wedstrijdId);
  const [bewerkId, setBewerkId] = useState<string | null>(null);

  if (!geladen) return <p className="text-sm text-neutral-500">Laden...</p>;

  const regels = naarLogRegels(state.schotpogingen, state.tegendoelpunten);

  if (regels.length === 0) {
    return <p className="text-sm text-neutral-500">Nog geen acties gelogd.</p>;
  }

  return (
    <ul className="flex w-full flex-col divide-y divide-neutral-100">
      {regels.map((regel) => (
        <li key={regel.item.id} className="flex flex-col gap-2 py-3">
          {bewerkId === regel.item.id ? (
            regel.soort === "schotpoging" ? (
              <SchotPogingBewerkRij
                poging={regel.item}
                onOpslaan={(poging) => {
                  void wijzigSchotPoging(poging);
                  setBewerkId(null);
                }}
                onAnnuleren={() => setBewerkId(null)}
              />
            ) : (
              <TegenDoelpuntBewerkRij
                doelpunt={regel.item}
                onOpslaan={(doelpunt) => {
                  void wijzigTegenDoelpunt(doelpunt);
                  setBewerkId(null);
                }}
                onAnnuleren={() => setBewerkId(null)}
              />
            )
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-900">
                Helft {regel.item.helft}, min {regel.item.minuut} —{" "}
                {regel.soort === "schotpoging"
                  ? `${regel.item.schutterNaam} (${regel.item.scoreType}, ${regel.item.resultaat})`
                  : `Tegendoelpunt (${regel.item.verdedigerNaam} gepasseerd)`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setBewerkId(regel.item.id)}
                >
                  Bewerken
                </button>
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() =>
                    void (regel.soort === "schotpoging"
                      ? verwijderSchotPoging(regel.item.id)
                      : verwijderTegenDoelpunt(regel.item.id))
                  }
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SchotPogingBewerkRij({
  poging,
  onOpslaan,
  onAnnuleren,
}: {
  poging: SchotPoging;
  onOpslaan: (poging: SchotPoging) => void;
  onAnnuleren: () => void;
}) {
  const [schutterNaam, setSchutterNaam] = useState(poging.schutterNaam);
  const [minuut, setMinuut] = useState(poging.minuut);
  const [scoreType, setScoreType] = useState<ScoreType>(poging.scoreType);
  const [resultaat, setResultaat] = useState<SchotResultaat>(poging.resultaat);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={schutterNaam}
        onChange={(e) => setSchutterNaam(e.target.value)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        value={minuut}
        onChange={(e) => setMinuut(Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <select
        value={scoreType}
        onChange={(e) => setScoreType(e.target.value as ScoreType)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      >
        {SCORE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <select
        value={resultaat}
        onChange={(e) => setResultaat(e.target.value as SchotResultaat)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      >
        <option value="raak">raak</option>
        <option value="mis">mis</option>
      </select>
      <button
        type="button"
        className="text-xs text-primary hover:underline"
        onClick={() =>
          onOpslaan({ ...poging, schutterNaam, minuut, scoreType, resultaat, gewijzigdOp: new Date().toISOString() })
        }
      >
        Opslaan
      </button>
      <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={onAnnuleren}>
        Annuleren
      </button>
    </div>
  );
}

function TegenDoelpuntBewerkRij({
  doelpunt,
  onOpslaan,
  onAnnuleren,
}: {
  doelpunt: TegenDoelpunt;
  onOpslaan: (doelpunt: TegenDoelpunt) => void;
  onAnnuleren: () => void;
}) {
  const [verdedigerNaam, setVerdedigerNaam] = useState(doelpunt.verdedigerNaam);
  const [minuut, setMinuut] = useState(doelpunt.minuut);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={verdedigerNaam}
        onChange={(e) => setVerdedigerNaam(e.target.value)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        value={minuut}
        onChange={(e) => setMinuut(Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        className="text-xs text-primary hover:underline"
        onClick={() => onOpslaan({ ...doelpunt, verdedigerNaam, minuut, gewijzigdOp: new Date().toISOString() })}
      >
        Opslaan
      </button>
      <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={onAnnuleren}>
        Annuleren
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create the route**

`apps/scoreformulier/src/app/wedstrijd/[id]/log/page.tsx`:
```tsx
import Link from "next/link";
import { Container } from "@korfbaltools/ui";
import { MatchLog } from "@/components/MatchLog";

export default async function WedstrijdLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">Wedstrijdlog</h1>
          <Link href={`/wedstrijd/${id}`} className="text-primary hover:underline">
            Terug naar wedstrijd
          </Link>
        </div>
        <MatchLog wedstrijdId={id} />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Manual smoke test (full MVP flow)**

Run: `pnpm --filter @korfbaltools/scoreformulier dev`

In the browser:
1. From a match with a few logged schotpogingen/tegendoelpunten (from Task 10's test data, or fresh ones), click "Log bekijken".
2. Confirm all actions appear, sorted by helft then minuut.
3. Click "Bewerken" on a schotpoging row, change `resultaat` from raak to mis, click "Opslaan" — row updates, and going back to the live screen shows the stand recalculated.
4. Click "Verwijderen" on a tegendoelpunt row — row disappears, stand updates accordingly on the live screen.
5. Reload the log page — edits/deletes persisted (IndexedDB round-trip).

- [ ] **Step 4: Run full test suite and typecheck across the repo**

Run: `pnpm --filter @korfbaltools/scoreformulier-logic test`
Expected: PASS (14 tests)

Run: `pnpm --filter @korfbaltools/scoreformulier typecheck && pnpm --filter @korfbaltools/scoreformulier lint`
Expected: both pass clean.

- [ ] **Step 5: Commit**

```bash
git add apps/scoreformulier/src/components/MatchLog.tsx apps/scoreformulier/src/app/wedstrijd
git commit -m "feat(scoreformulier): add match log with edit/delete"
```

---

## Out of scope for this plan (tracked in the spec, section 7)

- Sync to a backend/server
- Seizoensstatistieken across multiple matches
- Koppeling met teamindeling.dezwaluwen.nl
- PWA-shell / offline page-load resilience
- Login/rollen
