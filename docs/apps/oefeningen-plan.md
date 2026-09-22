# Oefeningen — Plan van aanpak

Onderdeel van de `korfbaltools` monorepo. Trainers zoeken oefeningen op leeftijd, focus en niveau, en
zetten ze in een eigen trainingslijst die ze kunnen printen.

## 1. Doel

Trainers hebben nu geen plek binnen korfbaltools.nl om oefeningen op te zoeken. Een trainer kiest een
leeftijdscategorie en een focus, krijgt passende oefeningen te zien (met niveau-indicatie), en voegt de
gekozen oefeningen toe aan een trainingslijst met duur, volgorde en eigen notities. Die lijst is printbaar.

Oefeningen zijn markdown-bestanden in de repo — geen database, geen beheerscherm. Een nieuwe oefening is
een commit + deploy. Dit is de eerste app in de monorepo met een content-pipeline (gray-matter +
react-markdown); die bestaat hier nog niet.

## 2. Vastgestelde keuzes

| Onderwerp | Keuze |
|---|---|
| App | `apps/oefeningen`, package `@korfbaltools/oefeningen`, poort 3005, `basePath: "/oefeningen"` |
| Leeftijdscategorieën | `4-7`, `8-12`, `13-18` |
| Focus | `aanvallen`, `verdedigen`, `gooien-vangen`, `schottechniek`, `wedstrijdsituaties` |
| Niveau | 1–3 sterren |
| Content | `apps/oefeningen/content/oefeningen/*.md`, gelezen bij build |
| Afbeelding | optioneel frontmatter-veld, bestanden in `public/images/` — geen beeld meegeleverd |
| Zoekflow | wizard (leeftijd → focus) → resultaatlijst met verfijnfilters |
| Trainingsbouwer | localStorage: duur per oefening + totaal, volgorde omhoog/omlaag, notitie per oefening, printbaar |
| Zichtbaarheid | `APP_OEFENINGEN_ENABLED="false"` in `.env.example` (lokaal zelf op `true` zetten om te testen) |
| Seed | ~15 oefeningen, 3 per focus, verdeeld over leeftijden en niveaus |

### Niet in scope (nu)

- Trainingen server-side opslaan of delen (blijft in de browser, zoals teamindeling)
- Veldtekening-generator (SVG met posities uit frontmatter)
- Beheerscherm voor oefeningen, accounts of rollen

## 3. App-skelet

`apps/scoreformulier` is de template (kleinste, nieuwste app). Deze bestanden zijn qua vorm 1-op-1:

- `package.json` — naam `@korfbaltools/oefeningen`, scripts met `--port 3005`.
  Dependencies: `@korfbaltools/ui`, `next`, `react`, `react-dom`, `gray-matter`, `react-markdown`,
  `remark-gfm`, `zod`, `server-only` (**expliciet opnemen** — scoreformulier leunt hier op hoisting).
  DevDependencies identiek aan scoreformulier.
- `next.config.mjs` — `basePath: "/oefeningen"`, `outputFileTracingRoot`,
  `transpilePackages: ["@korfbaltools/config", "@korfbaltools/ui"]`, plus:
  ```js
  outputFileTracingIncludes: { "/**/*": ["./content/**/*"] }
  ```
  (`/lijst` is dynamisch door searchParams en leest de markdown dus ook at runtime.)
- `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
  `next-env.d.ts`, `src/app/globals.css` — letterlijk overnemen.
- `.env.example` — alleen `MAIN_APP_URL="http://localhost:3000"`.
- `src/lib/main-api.ts` — letterlijk overnemen van `apps/scoreformulier/src/lib/main-api.ts`
  (levert `getNavApps()` voor de gedeelde toolbar).
- `src/app/layout.tsx` — variant van `apps/vastspelen/src/app/layout.tsx` (inclusief
  `GoogleAnalytics` + `CookieConsent`), metadata-titel "Oefeningen".

Hergebruik uit `@korfbaltools/ui`: `Container`, `KorfbalToolBar`, `Footer`, `cn`, `Spinner`.
Kleuren en typografie komen mee via `@korfbaltools/config/tailwind/preset` — geen eigen tokens
definiëren (DESIGN.md: één visuele familie, plat, `primary` = navy, `secondary` = oranje alleen
voor echte CTA's).

## 4. Contentmodel

`apps/oefeningen/content/oefeningen/<slug>.md`, slug = bestandsnaam.

```yaml
---
titel: "Doorloopbal estafette"
samenvatting: "Korte doorloopbal in wedstrijdtempo, twee rijen tegen elkaar."
leeftijden: ["8-12", "13-18"]
focus: ["schottechniek", "aanvallen"]
niveau: 2              # 1 | 2 | 3
duur: 15               # minuten
spelers: "8-16"
materiaal: ["korfbalpaal", "2 ballen", "pionnen"]
afbeelding: "/images/doorloopbal.png"   # optioneel; Next prefixt de basePath zelf
---

## Opzet
## Uitvoering
## Coachpunten
## Variaties
```

Plus `content/oefeningen/README.md` met dit format, zodat oefeningen later zonder code-kennis
toegevoegd kunnen worden.

## 5. Contentlaag

`src/lib/content.ts`:

- `import "server-only"`.
- Constanten `LEEFTIJDEN`, `FOCUS` (key + label) en `NIVEAUS` — één bron voor filters, wizard en validatie.
- Zod-schema voor de frontmatter. Een ongeldig bestand geeft een `throw` met de bestandsnaam erin, zodat
  de build hard faalt in plaats van stil een oefening te verliezen. Het schema blijft **in de app**, niet
  in `packages/types` (single-use).
- Module-scope index: `fs.readdirSync` + `gray-matter` bij de eerste import.
- Exports: `getAlleOefeningen()`, `getOefening(slug)` en
  `zoekOefeningen({ leeftijd, focus, niveau, duurMax, q })`. Filteren is puur array-werk, geen extra
  dependency.

## 6. Routes

| Route | Type | Inhoud |
|---|---|---|
| `/` | server | Wizard stap 1: drie leeftijdskaarten, link naar `/focus?leeftijd=…`. Korte uitleg wat de app doet. |
| `/focus` | server | Wizard stap 2: vijf focuskaarten met het aantal beschikbare oefeningen, link naar `/lijst?leeftijd=…&focus=…`. Terug-link naar stap 1. Zonder `leeftijd` een redirect naar `/`. |
| `/lijst` | server (searchParams) | Resultaten als kaartgrid plus verfijnfilterbalk (niveau, max duur, zoekterm) die de query-string bijwerkt — dus deelbaar. Lege staat met "filters ruimer zetten". |
| `/oefening/[slug]` | server, `generateStaticParams` | Volledige oefening: metadatabalk (leeftijden, focus, niveau, duur, spelers, materiaal), optionele afbeelding via `next/image`, markdown-body, knop "Toevoegen aan training". |
| `/training` | client | Trainingsbouwer en printweergave. |
| `/api/training` | route handler | `GET ?slugs=a,b` geeft `[{ slug, titel, duur, focus, niveau, markdown }]` voor de trainingspagina. |

De wizard-stappen zijn echte links (geen JS-state), dus bedienbaar met het toetsenbord en deelbaar.

## 7. Trainingsbouwer

- `src/lib/use-training.ts`: React context plus `localStorage` onder de key
  `korfbaltools:oefeningen:training:v1`.
  State: `{ titel: string, datum: string, items: Array<{ slug, duurMinuten, notitie }> }`.
  Acties: `voegToe`, `verwijder`, `verplaatsOmhoog`, `verplaatsOmlaag`, `zetDuur`, `zetNotitie`, `leeg`.
  Lezen gebeurt in een `useEffect` (hydration-safe; de badge toont niets tot `mounted`).
- Provider in `layout.tsx`; een regel onder de nav toont "Mijn training (n) · totaal x min" met een link
  naar `/training`. De "Toevoegen"-knop op de kaart en de detailpagina toont "Toegevoegd" zodra de slug
  al in de lijst zit.
- `/training` haalt de slugs uit de context, fetcht `/api/training` en rendert per item een duur-invoer,
  een notitieveld, omhoog/omlaag en verwijderen. Bovenaan een bewerkbare titel + datum en de totale duur.
- Printen gaat via `window.print()` plus `@media print` in `globals.css`: toolbar, footer en alle knoppen
  verborgen, per oefening de volledige markdown-tekst en de notitie zichtbaar. Geen PDF-library.

## 8. Seedcontent

15 markdown-oefeningen, 3 per focus, gespreid over de drie leeftijdscategorieën en de niveaus 1–3, in het
Nederlands en in de bestaande toon (direct, concreet, geen uitroeptekens). Het veld `afbeelding` blijft
leeg — het werkt zodra er tekeningen zijn.

## 9. Registratie in apps/main

Vijf plekken, zoals bij elke tool-app:

1. `apps/main/src/lib/apps.ts` — `"oefeningen"` toevoegen aan `APP_KEYS`;
   `oefeningen: process.env.APP_OEFENINGEN_ENABLED` aan `ENABLED_BY_KEY` (**letterlijk uitschrijven**
   vanwege edge-runtime inlining); een `DEFINITIONS`-entry met titel "Oefeningen", beschrijving,
   `href: "/oefeningen"` en `preview: null`.
2. `apps/main/next.config.mjs` — dev-rewriteblok op `process.env.OEFENINGEN_APP_URL`, exact in de vorm
   van het scoreformulier-blok.
3. `apps/main/vercel.json` — twee rewrites naar `https://korfbaltools-oefeningen.vercel.app`.
4. `apps/main/.env.example` — `APP_OEFENINGEN_ENABLED="false"` en
   `OEFENINGEN_APP_URL="http://localhost:3005"`.
5. `apps/main/src/middleware.ts` — **geen wijziging**, die leest `APP_KEY_BY_PATH_PREFIX` zelf.

Het deploy-runbook staat in `docs/vercel-deployment.md`: nieuw Vercel-project met root `apps/oefeningen`,
ignored build step `npx turbo-ignore`, env `MAIN_APP_URL=https://korfbaltools.nl`.

## 10. Verificatie

1. `pnpm install` vanaf de repo-root.
2. `pnpm --filter @korfbaltools/oefeningen typecheck` en `lint` zijn schoon.
3. `pnpm --filter @korfbaltools/oefeningen build` slaagt; ongeldige frontmatter laat de build bewust
   falen (te testen door tijdelijk `niveau: 9` te zetten).
4. Lokaal `APP_OEFENINGEN_ENABLED="true"` in `apps/main/.env`, dan `pnpm dev`. Via
   `http://localhost:3000/oefeningen`:
   - wizard: leeftijd → focus → lijst; filters wijzigen de URL en het resultaat;
   - de detailpagina toont de markdown correct en "Toevoegen aan training" werkt;
   - `/training`: volgorde wijzigen, duur aanpassen, notitie typen, herladen en de lijst staat er nog;
   - printvoorbeeld (⌘P) toont alleen de training, zonder toolbar of knoppen;
   - toolbar en homepagetegel van apps/main tonen "Oefeningen".
5. `APP_OEFENINGEN_ENABLED` terug op `false`: `/oefeningen` gaat naar `/niet-beschikbaar`.
6. `pnpm turbo lint typecheck test` vanaf de root (hetzelfde commando als CI).
