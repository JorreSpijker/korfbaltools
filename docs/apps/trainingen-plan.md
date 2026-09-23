# Trainingen — Plan van aanpak

Onderdeel van de `korfbaltools` monorepo, bereikbaar op **korfbaltools.nl/trainingen**. Trainers zoeken
oefeningen op wat ze willen trainen en voor welke leeftijd, en zetten ze in een eigen training die ze
kunnen printen. Mobile-first en installeerbaar als PWA.

## 1. Doel

Trainers hebben nu geen plek binnen korfbaltools.nl om oefeningen op te zoeken. Een trainer kiest wat hij
wil trainen en voor welke leeftijdscategorie, krijgt passende oefeningen te zien, en voegt ze toe aan een
training met duur, volgorde en eigen notities. Trainingen worden bewaard en zijn printbaar.

Elke oefening kent tot drie uitvoeringen — **Simpel, Basis en Uitgebreid** — die de trainer op de
detailpagina omschakelt. Zo past dezelfde oefening bij een groep die hem net leert en bij een groep die
hem al kan, zonder dat de trainer door drie losse oefeningen moet bladeren.

De doelgroep is jong en gebruikt vooral de smartphone, langs het veld en in de kleedkamer. Daarom: elk
scherm wordt op 360px ontworpen, de app is installeerbaar op het beginscherm, en de bewaarde trainingen
werken zonder netwerk.

Oefeningen zijn markdown-bestanden in de repo — geen database, geen beheerscherm. Een nieuwe oefening is
een commit + deploy. Dit is de eerste app in de monorepo met een content-pipeline (gray-matter +
react-markdown); die bestaat hier nog niet.

## 2. Vastgestelde keuzes

| Onderwerp | Keuze |
|---|---|
| App | `apps/trainingen`, package `@korfbaltools/trainingen`, poort 3005, `basePath: "/trainingen"` |
| App-key in apps/main | `trainingen`, href `/trainingen`, titel "Trainingen" |
| Startpagina | twee knoppen: **Mijn trainingen** en **Zoek oefeningen** |
| Wizard | stap 1 "Wat wil je trainen?" (focus, meerdere aanvinkbaar) → stap 2 leeftijdscategorie → lijst |
| Design | `docs/designs/trainingen/Design.html` — 11 schermen, allemaal op 360px |
| Focus | `aanvallen`, `verdedigen`, `gooien en vangen`, `schottechniek`, `rebounden`, `spelsituaties` |
| Leeftijdscategorieën | `4-7`, `8-12`, `13-18` |
| Niveau | **geen sterren en geen filter** — per oefening een toggle Simpel / Basis / Uitgebreid op de detailpagina |
| Content | `apps/trainingen/content/oefeningen/*.md`, gelezen bij build |
| Afbeelding | optioneel frontmatter-veld, bestanden in `public/images/` — geen beeld meegeleverd |
| Trainingen | meerdere bewaard in localStorage, één actief; platte lijst per training (geen blokken) |
| Per oefening in een training | gekozen variant (achteraf te wisselen), duur, volgorde, eigen notitie |
| Favorieten | hartje per oefening, eigen route plus filterchip in de lijst |
| Delen | niet — printen/opslaan-als-pdf via de browser |
| SEO | **noindex**, geen sitemap of OG-image (later op te pakken) |
| Mobile-first | alle schermen op 360px ontworpen, `md:` alleen als verrijking; tapdoelen ≥ 44px |
| PWA | installeerbaar, eigen manifest + service worker, offlinepagina, trainingen offline bruikbaar |
| Zichtbaarheid | `APP_TRAININGEN_ENABLED="false"` in het env-voorbeeldbestand (lokaal zelf op `true` zetten om te testen) |
| Seed | ~18 oefeningen, 3 per focus, verdeeld over de leeftijdscategorieën |

### Niet in scope (nu)

- Trainingen server-side opslaan of delen (blijft in de browser, zoals teamindeling)
- Deelbare link of Web Share
- Warming-up/kern/afsluiting als aparte blokken — een training is één platte lijst
- Filteren op niveau; de variant is een keuze per oefening, geen eigenschap om op te zoeken
- Veldtekening-generator (SVG met posities uit frontmatter)
- Beheerscherm voor oefeningen, accounts of rollen
- Vindbaarheid via Google — de app staat bewust op noindex tot je er iets mee wilt
- Volledig offline doorzoekbare oefeningenbank — alleen bezochte pagina's en de bewaarde trainingen zijn
  gegarandeerd offline; de rest komt uit de runtime-cache van de service worker

## 3. App-skelet

`apps/teamindeling` is de template voor de PWA-kant (de enige tool-app met manifest, icons en service
worker); `apps/scoreformulier` voor de kale structuur. Bestanden:

- `package.json` — naam `@korfbaltools/trainingen`, scripts met `--port 3005`.
  Dependencies: `@korfbaltools/ui`, `next`, `react`, `react-dom`, `gray-matter`, `react-markdown`,
  `remark-gfm`, `zod`, `server-only` (**expliciet opnemen** — scoreformulier leunt hier op hoisting).
  DevDependencies identiek aan scoreformulier.
- `next.config.mjs` — `basePath: "/trainingen"`, `outputFileTracingRoot`,
  `transpilePackages: ["@korfbaltools/config", "@korfbaltools/ui"]`, plus:
  ```js
  outputFileTracingIncludes: { "/**/*": ["./content/**/*"] }
  ```
  (`/lijst` is dynamisch door searchParams en leest de markdown dus ook at runtime.)
- `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
  `next-env.d.ts`, `src/app/globals.css` — letterlijk overnemen van scoreformulier.
- Env-voorbeeldbestand — alleen `MAIN_APP_URL="http://localhost:3000"`.
- `src/lib/main-api.ts` — letterlijk overnemen van `apps/scoreformulier/src/lib/main-api.ts`
  (levert `getNavApps()` voor de gedeelde toolbar).
- `src/app/layout.tsx` — naar het model van `apps/teamindeling/src/app/layout.tsx`: `GoogleAnalytics`,
  `KorfbalToolBar`, `Footer`, `CookieConsent`, `InstallPrompt`,
  `ServiceWorkerRegister swUrl="/trainingen/sw.js"`, plus de `TrainingProvider` (§9) en de mobiele
  actiebalk (§9). `export const viewport: Viewport = { themeColor: "#0E1C31" }` en in `metadata`
  `robots: { index: false, follow: false }`.

Hergebruik uit `@korfbaltools/ui`: `Container`, `KorfbalToolBar`, `Footer`, `cn`, `Spinner`,
`InstallPrompt`, `ServiceWorkerRegister`, `appIconResponse`. De toolbar is al responsive
(hamburger onder `md`, sticky, 50px hoog + 8px rand — content begint op `pt-[60px]`).

## 3b. Design

Bron: `docs/designs/trainingen/Design.html` — een zelfuitpakkende bundel met elf schermen, één per
route, allemaal op 360px. De maten, kleuren en teksten in de app komen daar letterlijk uit.

**Tokens** staan in `tailwind.config.ts` naast de brandpreset (die blijft nodig voor de gedeelde
toolbar en footer):

| Token | Waarde | Gebruik |
|---|---|---|
| `ink` | `#0E1C31` | tekst, actieve segmenten, actiebalk — gelijk aan `primary-500` |
| `muted` | `#4B5566` | bijschriften |
| `line` | `#D9DEE6` | randen |
| `tint` | `#E7EBF2` | vlakken, segmented controls, icoonblokjes |
| `outline` / `dash` | `#8A94A6` / `#A9B2C2` | invoerranden, streepjesranden |
| `page` | `#F4F5F7` | paginaondergrond |
| `accent` | `#C2410C` | primaire knoppen, hartje, stap-label |
| `accent-soft` / `accent-light` | `#FBE7DC` / `#FFE6D5` | zachte vlakken en tekst op oranje |
| `ok` / `alert` | `#1F6B3A` / `#B42318` | "in je training", verwijderen |

**Letter**: Figtree 400–800, via `next/font/google` in de layout, dus zelfgehost — de PWA heeft zijn
letter ook offline. `fontFamily.sans` wijst in deze app naar Figtree.

**Vaste maten uit het design**: knoppen en tapdoelen 44px, primaire knoppen 52px, kaartranden 1px
(2px als de kaart actief of gekozen is), radii 10/12/14/16, bottom sheet 20px bovenhoeken.

### Twee bewuste afwijkingen

1. **Toolbar en footer zijn de gedeelde componenten uit `@korfbaltools/ui`**, niet de vereenvoudigde
   balk uit het design. Het design tekent dezelfde chrome (navy balk, oranje rand, logo links,
   hamburger rechts), maar de gedeelde versie haalt de app-lijst op uit `/api/apps` — zonder die
   komt de app-switcher te vervallen. Gevolg: de oranje in de toolbar is de merk-oranje `#F16018`,
   terwijl de app zelf `#C2410C` gebruikt.
2. **Geen pre-selectie in de wizard.** Het design toont stap 1 met Aanvallen en Schottechniek al
   aangevinkt; dat is mock-state. In de app begint stap 1 leeg en staat de knop op
   "Kies minstens één focus".

## 4. Mobile-first uitgangspunten

Gelden voor elk scherm in §8; geen aparte mobiele variant, maar één layout die op 360px begint.

- **Basis is één kolom.** Grid-klassen alleen met een `sm:`/`md:`-prefix. Geen horizontale scroll op 360px.
- **Op desktop een kolom, geen volle breedte.** Alle inhoud staat in `Scherm` /`BalkInhoud`
  (`src/components/scherm.tsx`): `max-w-screen-2xl` gecentreerd, `px-5` en vanaf `md` `px-6`. Dezelfde
  breedte als `apps/teamindeling`, die de toolbar en footer `containerClassName="max-w-screen-2xl"`
  meegeeft — de layout hier doet dat ook, zodat chrome en inhoud uitlijnen. Dat bestand importeert
  bewust geen `cn` uit `@korfbaltools/ui`: die barrel trekt `pwa-icon` en daarmee `next/og` de
  clientbundle in, wat op `Can't resolve 'fs'` stukloopt.
- **De toolbar krijgt geen wrapper.** `KorfbalToolBar` is zelf `sticky top-0`; een omhullende `div` wordt
  zijn containing block en dan scrollt hij alsnog weg. Print-verbergen gaat daarom via zijn `className`.
  De 60px `padding-top` op de inhoud blijft nodig: de toolbar positioneert zijn eigen inhoud absoluut en
  neemt in de flow nauwelijks hoogte in.

### Desktop (vanaf `md`, 768px)

Het design is mobiel; de desktopvorm is er vanaf `md` overheen gelegd, zodat het mobiele scherm
onaangeroerd blijft en later verfijnd kan worden. Wat er verandert:

- **Naast elkaar** — startknoppen en focuskaarten in twee kolommen, leeftijdskaarten in drie (die
  worden dan staande kaarten zonder chevron), oefeningkaarten en trainingen in twee kolommen en vanaf
  `xl` in drie.
- **Vaste balken schuiven mee.** "Verder", "Toevoegen aan training" en "Printen" staan vanaf `md` op hun
  natuurlijke plek in de pagina en zijn dan zo breed als hun tekst. De trainingsbalk blijft bestaan maar
  wordt een navy blok onderaan de pagina in plaats van een strook over het venster.
- **Tweekoloms detailpagina** — de metagegevens staan rechts in een zijkolom van 17rem (vanaf `lg` blijft
  die meescrollen), de tekst links. Op mobiel staat de metakaart gewoon tussen samenvatting en opzet.
- **Trainingsbouwer** — duur en notitie naast elkaar per oefening.
- **Bottom sheet wordt een dialoog** — vanaf `md` gecentreerd in beeld in plaats van vastgeplakt onderaan.
- **Ruimer** — grotere koppen, meer witruimte tussen secties, iets meer kaartpadding.
- **Tapdoelen minimaal 44×44px** (`min-h-11`), met echte witruimte ertussen — geen rijen linkjes van 14px.
- **Inputs en selects op 16px** (`text-base`). Kleiner laat iOS Safari het scherm inzoomen bij focus.
- **Primaire actie onderin.** Wat de duim moet raken staat onderaan het scherm, niet bovenaan.
  Vaste balken krijgen `pb-[env(safe-area-inset-bottom)]` voor iPhones met een home-indicator.
- **Geen drag-and-drop.** Volgorde wijzigen gaat met omhoog/omlaag-knoppen — drag is op touch onnauwkeurig
  en kost een extra library.
- **Geen hover-afhankelijke UI.** Alles wat hover toont moet ook zonder hover bereikbaar zijn.
- **Zoomen blijft toegestaan.** Geen `user-scalable=no` of `maximum-scale` in de viewport.
- **Afbeeldingen via `next/image`** met `sizes="(min-width: 768px) 640px, 100vw"`.
- **Filters zijn geen sidebar.** Op mobiel een rij horizontaal scrollbare chips plus een bottom sheet
  voor de rest (§8, `/lijst`). Vanaf `md:` wordt dat een gewone filterbalk.

## 5. PWA

Zelfde opzet als `apps/teamindeling`, met `/trainingen` als basePath.

- `src/app/manifest.ts` — kopie van `apps/teamindeling/src/app/manifest.ts` met
  `BASE_PATH = "/trainingen"`, `name: "Trainingen"`, `short_name: "Trainingen"`,
  `start_url: "/trainingen"`, `scope: "/trainingen/"`, `display: "standalone"`,
  `background_color: "#ffffff"`, `theme_color: "#0E1C31"`.
  Let op: Next past de basePath **niet** toe op `src`, `start_url` en `scope` — die staan er daarom
  letterlijk in.
- Icons — `icon.svg`, `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` overnemen uit
  `apps/teamindeling/src/app/` (zelfde merklogo, geen nieuwe assets nodig), plus `apple-icon.tsx`:
  ```tsx
  import { appIconResponse } from "@korfbaltools/ui";
  export const size = { width: 180, height: 180 };
  export const contentType = "image/png";
  export default function AppleIcon() { return appIconResponse(180); }
  ```
- `public/sw.js` — kopie van `apps/main/public/sw.js` (network-first met cache-fallback), met:
  ```js
  const CACHE_NAME = "trainingen-shell-v1";
  const OFFLINE_URL = "/trainingen/offline";
  const PRECACHE_URLS = [
    "/trainingen",
    "/trainingen/mijn-trainingen",
    "/trainingen/mijn-trainingen/bekijk",
    "/trainingen/favorieten",
    OFFLINE_URL,
  ];
  ```
  Bezochte oefeningpagina's belanden vanzelf in de runtime-cache, dus wie zijn training thuis
  voorbereidt heeft die oefeningen op het veld nog.
- `src/app/offline/page.tsx` — kopie van `apps/main/src/app/offline/page.tsx`, met `robots: { index: false }`.
- `ServiceWorkerRegister swUrl="/trainingen/sw.js"` en `InstallPrompt` in de layout.

> Los gevonden bug, niet in deze opdracht: `apps/teamindeling/public/sw.js` cachet `/teamplanner`
> in plaats van `/teamindeling`, waardoor zijn precache en offline-fallback nooit werken.

## 6. Contentmodel

`apps/trainingen/content/oefeningen/<slug>.md`, slug = bestandsnaam.

```markdown
---
titel: "Doorloopbal estafette"
samenvatting: "Korte doorloopbal in wedstrijdtempo, twee rijen tegen elkaar."
leeftijden: ["8-12", "13-18"]
focus: ["schottechniek", "aanvallen"]
duur: 15               # minuten
spelers: "8-16"
materiaal: ["korfbalpaal", "2 ballen", "pionnen"]
afbeelding: "/images/doorloopbal.png"   # optioneel; Next prefixt de basePath zelf
---

Twee rijen bij de paal, één bal per rij. Wie geschoten heeft sluit achteraan aan.

## Simpel

Stilstaand aangeven, doorloopbal zonder verdediger.

## Basis

Aangever loopt mee, schutter kiest zelf links- of rechtsom.

## Uitgebreid

Passieve verdediger erbij; schutter moet eerst een schijnbeweging maken.
```

- **Geen `niveau` meer in de frontmatter.** De zwaarte zit in de varianten.
- Alles vóór de eerste variantkop is de **gedeelde opzet** en staat altijd in beeld.
- `## Basis` is verplicht; `## Simpel` en `## Uitgebreid` zijn optioneel. De toggle toont alleen de
  varianten die bestaan.
- Binnen een variant mag gewoon markdown staan (lijstjes, `###`-subkopjes, vet).

Plus `content/oefeningen/README.md` met dit format, zodat oefeningen later zonder code-kennis
toegevoegd kunnen worden.

## 7. Contentlaag

`src/lib/content.ts`:

- `import "server-only"`.
- Constanten `FOCUS` (key + label) en `LEEFTIJDEN` — één bron voor wizard, filters en validatie.
- Zod-schema voor de frontmatter. Een ongeldig bestand geeft een `throw` met de bestandsnaam erin, zodat
  de build hard faalt in plaats van stil een oefening te verliezen. Het schema blijft **in de app**, niet
  in `packages/types` (single-use).
- `splitVarianten(body)` splitst de markdown op de koppen `## Simpel`, `## Basis` en `## Uitgebreid` en
  geeft `{ gedeeld, varianten: { simpel?, basis, uitgebreid? } }`. Ontbreekt `## Basis`, dan een `throw`
  met de bestandsnaam — zelfde streng-falen als bij de frontmatter.
- Module-scope index: `fs.readdirSync` + `gray-matter` + `splitVarianten` bij de eerste import.
- Exports: `getAlleOefeningen()`, `getOefening(slug)` en `zoekOefeningen({ focus, leeftijd, duurMax, q })`
  — `focus` is een array, een oefening matcht als hij **minstens één** gekozen focus heeft. Filteren is
  puur array-werk, geen extra dependency.

## 8. Routes

Alle paden hieronder zijn relatief aan de basePath, dus `/` is live `korfbaltools.nl/trainingen`.

| Route | Live pad | Type | Inhoud |
|---|---|---|---|
| `/` | `/trainingen` | server | Startpagina: twee grote knoppen onder elkaar — **Mijn trainingen** (naar `/mijn-trainingen`) en **Zoek oefeningen** (naar `/zoek`). Eén regel uitleg erboven. Staat er een actieve training met oefeningen, dan toont de eerste knop het aantal en de totale duur. |
| `/zoek` | `/trainingen/zoek` | server + kleine client-form | Stap 1: "Wat wil je trainen?" — zes focussen als aanvinkbare kaarten (meerdere tegelijk) met het aantal beschikbare oefeningen. Vaste knop onderaan "Verder" naar `/zoek/leeftijd?focus=a,b`. Daaronder een tekstlink "Bekijk alle oefeningen" naar `/lijst` zonder filters. |
| `/zoek/leeftijd` | `/trainingen/zoek/leeftijd` | server | Stap 2: "Voor welke leeftijdscategorie?" — drie kaarten (4-7, 8-12, 13-18), elk een directe link naar `/lijst?focus=…&leeftijd=…`. Terug-link naar stap 1. Zonder `focus` een redirect naar `/zoek`. |
| `/lijst` | `/trainingen/lijst` | server (searchParams) | Resultaten als kaarten, één kolom op mobiel, `md:grid-cols-2`. Kaart toont titel, samenvatting, duur, leeftijden en welke varianten bestaan. Erboven een sticky rij scrollbare chips (de gekozen focussen, aan/uit te tikken, plus "alleen favorieten") en een knop "Meer filters" die een bottom sheet opent (leeftijd, max duur, zoekterm). Elke wijziging schrijft de query-string, dus deelbaar. Lege staat met "filters ruimer zetten". |
| `/oefening/[slug]` | `/trainingen/oefening/…` | server, `generateStaticParams` | Volledige oefening: metadatabalk (leeftijden, focus, duur, spelers, materiaal), hartje voor favoriet, optionele afbeelding, gedeelde opzet, dan de **variant-toggle** (Simpel / Basis / Uitgebreid) met daaronder de gekozen variant. Onderaan een vaste actiebalk met "Toevoegen aan training". |
| `/favorieten` | `/trainingen/favorieten` | client | De opgeslagen favorieten als dezelfde kaarten; lege staat legt uit hoe je er een maakt. |
| `/mijn-trainingen` | `/trainingen/mijn-trainingen` | client | Overzicht van bewaarde trainingen (naam, datum, aantal oefeningen, totale duur), de actieve bovenaan gemarkeerd. Knoppen: openen, actief maken, hernoemen, verwijderen (met bevestiging), "Nieuwe training". Onder de lijst één regel: "Trainingen staan alleen in deze browser." |
| `/mijn-trainingen/bekijk` | `/trainingen/mijn-trainingen/bekijk?id=…` | client | Eén training: bouwen, bewerken, printen. |
| `/offline` | `/trainingen/offline` | server | Fallbackpagina van de service worker. |

De **variant-toggle** is een segmented control (drie knoppen naast elkaar, ≥ 44px hoog), standaard op
Basis. De keuze staat in de query (`?variant=uitgebreid`) zodat terug-navigeren en delen hem bewaren, en
wordt onthouden als voorkeur in localStorage voor de volgende oefening.

Bewust **geen** `[id]`-route voor een training: bij een dynamische route bestaat er per id eigen HTML, en
een training die na het laatste bezoek is aangemaakt zou offline op de offlinepagina uitkomen. Eén statische
route die de `id` uit de query leest, is met één cache-entry altijd offline beschikbaar.

De bottom sheet is een eigen client-component (vast blok onderaan + overlay, sluit op Escape en op tik
buiten) — geen extra library.

## 9. Trainingen, favorieten en opslag

`src/lib/use-training.ts`: React context plus `localStorage` onder de key `korfbaltools:trainingen:v1`.

```ts
type Variant = "simpel" | "basis" | "uitgebreid";

type TrainingItem = {
  slug: string;
  titel: string;
  focus: string[];
  gedeeld: string;                          // markdown boven de varianten
  varianten: Partial<Record<Variant, string>>;
  variant: Variant;                         // wat er nu getoond/geprint wordt
  duurMinuten: number;                      // begint op de duur uit de frontmatter
  notitie: string;
};

type Training = {
  id: string;           // crypto.randomUUID()
  titel: string;        // standaard "Training 23 sep"
  datum: string;        // ISO-datum
  items: TrainingItem[];
};

type Opslag = {
  versie: 1;
  actieveId: string | null;
  trainingen: Training[];
  favorieten: string[];        // slugs
  variantVoorkeur: Variant;    // laatst gekozen toggle-stand
};
```

- **Snapshot bij toevoegen.** Een item bewaart de hele tekst van de oefening, inclusief alle bestaande
  varianten. Daardoor heeft `/mijn-trainingen/bekijk` nul netwerkverkeer nodig, werkt het offline, en kan
  de trainer daar alsnog per oefening van variant wisselen. Er is dus ook geen API-route. Prijs: verandert
  een oefening later in de repo, dan blijft de opgeslagen versie staan tot de trainer hem opnieuw toevoegt.
  Bij ~18 oefeningen van een paar kB blijft dit ruim binnen de localStorage-limiet.
- **Actieve training.** "Toevoegen aan training" zet de oefening altijd in de actieve training, met de
  variant die op dat moment in beeld staat, zonder tussenscherm. Is er nog geen training, dan maakt de app
  er stil één aan met de datum van vandaag als titel. Wisselen van actieve training gebeurt in
  `/mijn-trainingen`.
- Acties op de context: `voegToe`, `verwijderItem`, `verplaatsOmhoog`, `verplaatsOmlaag`, `zetDuur`,
  `zetNotitie`, `zetVariant`, `nieuweTraining`, `zetActief`, `hernoem`, `verwijderTraining`,
  `toggleFavoriet`.
- Lezen gebeurt in een `useEffect` (hydration-safe; de teller toont niets tot `mounted`).
- **Mobiele actiebalk.** Vast onderaan het scherm, op elke pagina behalve de startpagina en de
  trainingsschermen: "Mijn training · n oefeningen · 45 min" met een link naar
  `/mijn-trainingen/bekijk?id=<actieve>`. Verdwijnt als de actieve training leeg is. Krijgt
  `pb-[env(safe-area-inset-bottom)]`; de pagina krijgt onderaan evenveel padding zodat de balk niets
  afdekt. Vanaf `md:` mag dezelfde informatie als regel onder de nav staan.
- De "Toevoegen"-knop toont "Toegevoegd" zodra de slug al in de actieve training zit.
- `/mijn-trainingen/bekijk` rendert per item een kaart met de titel, dezelfde variant-toggle (nu als
  wijziging op het opgeslagen item), een duur-stepper (− / + van 5 minuten, met een invoerveld ernaast),
  een notitie-textarea, omhoog/omlaag en verwijderen. Bovenaan een bewerkbare titel en datum plus de
  totale duur.
- Printen gaat via `window.print()` plus `@media print` in `globals.css`: toolbar, footer, actiebalk,
  toggles en alle knoppen verborgen; per oefening de gedeelde opzet, **alleen de gekozen variant** en de
  notitie zichtbaar. Geen PDF-library — op mobiel levert het deelmenu van de browser hetzelfde op
  ("Print" → "Bewaar als pdf").
- Verwijderen van een training vraagt om bevestiging; verwijderen van één oefening niet (direct terug te
  zetten door hem opnieuw toe te voegen).

## 10. Seedcontent

18 markdown-oefeningen, 3 per focus, gespreid over de drie leeftijdscategorieën, in het Nederlands en in
de bestaande toon (direct, concreet, geen uitroeptekens). Elke oefening krijgt een `## Basis`; waar het
zinnig is ook `## Simpel` en `## Uitgebreid` — niet geforceerd alledrie. Het veld `afbeelding` blijft
leeg; het werkt zodra er tekeningen zijn.

## 11. Registratie in apps/main

Vijf plekken, zoals bij elke tool-app:

1. `apps/main/src/lib/apps.ts` — `"trainingen"` toevoegen aan `APP_KEYS`;
   `trainingen: process.env.APP_TRAININGEN_ENABLED` aan `ENABLED_BY_KEY` (**letterlijk uitschrijven**
   vanwege edge-runtime inlining); een `DEFINITIONS`-entry met titel "Trainingen", beschrijving
   ("Zoek oefeningen en stel er een training mee samen."), `href: "/trainingen"` en `preview: null`.
2. `apps/main/next.config.mjs` — dev-rewriteblok op `process.env.TRAININGEN_APP_URL`, exact in de vorm
   van het scoreformulier-blok, met bron `/trainingen/:path*`.
3. `apps/main/vercel.json` — twee rewrites (`/trainingen` en `/trainingen/:path+`) naar
   `https://korfbaltools-trainingen.vercel.app`.
4. Het env-voorbeeldbestand van apps/main — `APP_TRAININGEN_ENABLED="false"` en
   `TRAININGEN_APP_URL="http://localhost:3005"`.
5. `apps/main/src/middleware.ts` — **geen wijziging**, die leest `APP_KEY_BY_PATH_PREFIX` zelf.

Het deploy-runbook staat in `docs/vercel-deployment.md`: nieuw Vercel-project met root `apps/trainingen`,
ignored build step `npx turbo-ignore`, env `MAIN_APP_URL=https://korfbaltools.nl`.

## 12. Verificatie

1. `pnpm install` vanaf de repo-root.
2. `pnpm --filter @korfbaltools/trainingen typecheck` en `lint` zijn schoon.
3. `pnpm --filter @korfbaltools/trainingen build` slaagt; een oefening zonder `## Basis` laat de build
   bewust falen (test door die kop tijdelijk te hernoemen).
4. Lokaal `APP_TRAININGEN_ENABLED="true"` zetten in de lokale env van apps/main, dan `pnpm dev`. Via
   `http://localhost:3000/trainingen`, **in DevTools op iPhone SE (375px)**:
   - geen horizontale scroll op enig scherm; alle knoppen ≥ 44px;
   - startpagina toont twee knoppen; "Mijn trainingen" en "Zoek oefeningen" gaan naar de juiste schermen;
   - wizard: twee focussen aanvinken → leeftijd kiezen → lijst toont oefeningen van beide focussen;
   - "Bekijk alle oefeningen" gaat naar de ongefilterde lijst;
   - chips en bottom sheet wijzigen de URL en het resultaat; de chip "alleen favorieten" werkt;
   - detailpagina: toggle wisselt tussen Simpel/Basis/Uitgebreid, ontbrekende varianten staan er niet,
     de keuze staat in de URL en geldt ook bij de volgende oefening;
   - hartje op een oefening zet hem in `/trainingen/favorieten`;
   - toevoegen zonder bestaande training maakt er stil één aan met de datum van vandaag, in de getoonde
     variant;
   - `/trainingen/mijn-trainingen`: tweede training aanmaken, actief maken, hernoemen, verwijderen met
     bevestiging; toevoegen landt daarna in de nieuwe actieve training;
   - `/trainingen/mijn-trainingen/bekijk?id=…`: variant wisselen, volgorde wijzigen, duur aanpassen,
     notitie typen, herladen en alles staat er nog;
   - een input focussen zoomt Safari/iOS-emulatie niet in;
   - printvoorbeeld (⌘P) toont per oefening alleen de gekozen variant, zonder toolbar, footer, actiebalk,
     toggles of knoppen.
5. PWA: `/trainingen/manifest.webmanifest` laadt, Application → Service Workers toont `sw.js` als
   activated, Application → Manifest toont icons en `standalone`. Daarna **Network offline**:
   - `/trainingen/mijn-trainingen` en een training die je net hebt aangemaakt blijven werken, inclusief
     wisselen van variant;
   - een niet eerder bezochte oefeningpagina valt terug op `/trainingen/offline`.
6. `view-source` van een oefeningpagina bevat `<meta name="robots" content="noindex, nofollow">`.
7. Lighthouse op mobiel: PWA installable, geen fouten onder Accessibility en Best Practices.
8. `APP_TRAININGEN_ENABLED` terug op `false`: `/trainingen` gaat naar `/niet-beschikbaar`.
9. `pnpm turbo lint typecheck test` vanaf de root (hetzelfde commando als CI).
