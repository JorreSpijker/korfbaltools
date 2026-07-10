# Scoreformulier MVP — Design

Bron: `docs/apps/scoreformulier-plan.md`. Dit document scopet de eerste bouwbare fase (MVP) uit dat plan: lokaal loggen van schotpogingen en tegendoelpunten tijdens een wedstrijd, zonder sync, zonder seizoensstatistieken, zonder koppeling met teamindeling.dezwaluwen.nl. Die drie komen later, als apart vervolg.

## 1. Scope

**Wel in MVP:**
- Wedstrijd starten (datum, tegenstander optioneel, teamnamen invoeren)
- Live invoerscherm: schotpoging en tegendoelpunt loggen tijdens de wedstrijd
- Stopwatch per helft (0–30 min), helftwissel
- Lopende stand, afgeleid uit ingevoerde acties
- Chronologisch overzicht/log met bewerk/verwijder per regel
- Lokale opslag in IndexedDB
- Wedstrijd afronden

**Niet in MVP (bewust, latere fase):**
- Sync naar backend/server
- Seizoensstatistieken (topscorers, percentages over meerdere wedstrijden)
- Koppeling met teamindeling.dezwaluwen.nl (spelerslijsten/ID's)
- PWA-shell (service worker/manifest) — aanname: toestel blijft open/actief tijdens de hele wedstrijd, geen page reload nodig
- Login/rollen — één gedeeld toestel, geen auth

## 2. Architectuur

Nieuwe app `apps/scoreformulier` in de monorepo, Next.js, zelfde patroon als `apps/vastspelen` (eigen `package.json`, `next.config.mjs`, `tailwind.config.ts`, eslint-config). Client-only: geen server-actions, geen Prisma/DB-koppeling in deze fase. Alle state client-side via `useReducer`, gepersisteerd in IndexedDB via de `idb`-library (lichte wrapper, voorkomt rauwe IndexedDB-boilerplate).

Geen extra state-library (zustand e.d.) — geen precedent in de monorepo, en `useReducer` volstaat voor dit formaat.

## 3. Datamodel (IndexedDB, MVP-versie)

```
Wedstrijd
- id
- datum
- tegenstander (optioneel)
- teamNamen: string[]        // 1x ingevoerd bij start, gebruikt voor dropdown
- status: bezig | afgerond
- huidigeHelft: 1 | 2
- helftGestart: boolean       // stopwatch-status van de huidige helft

SchotPoging
- id
- wedstrijdId
- schutterNaam             // uit teamNamen, of vrij ingevoerd (invaller niet in lijst)
- helft: 1 | 2
- minuut                    // 0-30, uit stopwatch
- scoreType: afstand | doorloop | strafworp
- resultaat: raak | mis
- aangemaaktOp / gewijzigdOp

TegenDoelpunt
- id
- wedstrijdId
- verdedigerNaam
- helft: 1 | 2
- minuut
- aangemaaktOp / gewijzigdOp
```

`gesynchroniseerd`-veld uit het oorspronkelijke plan is bewust weggelaten — zonder sync-fase is dat een orphan-veld.

**Afgeleide data (berekend, niet opgeslagen):**
- Eindstand = aantal SchotPoging met resultaat=raak, min aantal TegenDoelpunt
- Schotpercentage per speler / per scoretype

## 4. Scherm-flow

1. `/` — Wedstrijdenlijst (uit IndexedDB) + "nieuwe wedstrijd starten": datum (default vandaag), tegenstander (optioneel), teamnamen invoeren. Start helft 1.
2. `/wedstrijd/[id]` — Live invoerscherm:
   - Stopwatch voor huidige helft (start/pauze), toont minuut 0-30
   - Stand groot zichtbaar (eigen team vs tegenstander, afgeleid)
   - Knop "Schotpoging" → schutter kiezen (dropdown uit teamNamen + "anders..." vrij veld) → scoretype → raak/mis
   - Knop "Tegendoelpunt" → verdediger kiezen (dropdown + "anders...")
   - Helftwissel-knop (helft 1 → 2, stopwatch reset)
   - Link naar log
   - "Wedstrijd afronden"-knop → status naar afgerond, terug naar wedstrijdenlijst
3. `/wedstrijd/[id]/log` — Chronologische lijst van alle acties, met bewerk/verwijder-optie per regel (schutter/verdediger, type, resultaat, minuut aanpasbaar)

## 5. Componenten & state

- `lib/db.ts` — idb wrapper: open db, CRUD voor Wedstrijd/SchotPoging/TegenDoelpunt
- `lib/match-reducer.ts` — reducer voor live wedstrijd-state. Acties: `START_HELFT`, `PAUZE_HELFT`, `ADD_SCHOTPOGING`, `ADD_TEGENDOELPUNT`, `EDIT_ACTIE`, `DELETE_ACTIE`, `HELFTWISSEL`. Elke actie schrijft ook naar idb.
- `lib/derived.ts` — pure functies voor stand en schotpercentages, los van reducer-state
- `components/MatchStartForm.tsx`
- `components/LiveMatchScreen.tsx` (stopwatch + knoppen + stand)
- `components/ShotForm.tsx` / `components/ConcedeForm.tsx` (modals, zelfde patroon als `apps/teamindeling`'s `Modal.tsx`)
- `components/MatchLog.tsx` (lijst + inline edit/delete)

## 6. Testing

- Unit tests voor `lib/match-reducer.ts` en `lib/derived.ts` (stand/percentage-berekening) — zelfde patroon als de losstaande, geteste rekenlogica in `apps/vastspelen`.
- idb-wrapper (`lib/db.ts`) niet unit-testen (integratie met browser-API) — smoke-testen via handmatig testen in browser.

## 7. Vervolg (buiten deze spec)

- Sync-strategie + backend-endpoint ontwerpen
- Seizoensstatistieken-module
- Koppeling teamindeling.dezwaluwen.nl (speler-ID's delen i.p.v. vrije tekstvelden)
- Open vragen uit het oorspronkelijke plan (backend-keuze, conflict-resolutie bij dubbele invoer, login-systeem) worden dan pas relevant
