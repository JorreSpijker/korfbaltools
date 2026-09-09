# Plan: login verwijderen, apps via .env aan/uit

Branch: `feature/remove_login`

## Doel

1. Alle authenticatie weg (registreren, inloggen, wachtwoord-reset, e-mailverificatie, sessies, rollen, capabilities).
2. Toolbar blijft bestaan, maar alleen met logo + app-links. Geen inlog-/account-/uitlog-knoppen.
3. Alle apps zijn voor iedereen bereikbaar.
4. Welke apps zichtbaar/bereikbaar zijn wordt bepaald door `.env`-variabelen in plaats van de `AppConfig`-tabel + capabilities per gebruiker.

## Vastgestelde keuzes

| Onderwerp | Keuze |
|---|---|
| `apps/admin` | Volledig verwijderen uit de repo |
| `apps/vastspelen` + `/mijn-club` | Code blijft, staan standaard **uit** via `.env` |
| Database | Schema blijft ongewijzigd, geen migratie. Ongebruikte tabellen blijven staan |
| Apps met toggle | `teamindeling`, `vastspelen`, `scoreformulier`, `statistieken` |

## Aanname die bevestiging nodig heeft

`vastspelen` en `/mijn-club` zijn club-gescoped: hun API-routes halen `clubId` uit de ingelogde gebruiker
(`requireVastspelen`, `requireClubManager`). Zonder login bestaat die bron niet meer.

**Voorstel:** één env-variabele `DEFAULT_CLUB_ID` die de club-context levert zolang deze apps aan staan.
Is die niet gezet, dan geven de routes een nette 400/`app_disabled`-fout. Dit houdt de code compileerbaar en
werkend zonder nieuwe UI. Alternatief (club-kiezer in de UI) valt buiten deze opdracht.

## Env-ontwerp

`apps/main/.env.example` krijgt erbij:

```
# Apps aan/uit. Alles wat niet "true" is, staat uit: geen toolbar-link,
# geen tegel op de homepage, en de route geeft 404.
APP_TEAMINDELING_ENABLED="true"
APP_SCOREFORMULIER_ENABLED="true"
APP_VASTSPELEN_ENABLED="false"
APP_STATISTIEKEN_ENABLED="false"
APP_MIJN_CLUB_ENABLED="false"

# Club-context voor vastspelen en mijn-club zolang die apps aan staan.
DEFAULT_CLUB_ID=""
```

Weg uit `.env.example`: `ADMIN_APP_URL`, `RESEND_API_KEY`.
Erbij: `SCOREFORMULIER_APP_URL` (bestond al in `next.config.mjs`, niet in `.env.example`).

Alleen `apps/main` leest deze variabelen. De losse tool-apps blijven hun toolbar-links via
`/api/apps` ophalen, dus er is één bron van waarheid.

## Stappen

### 1. `packages/ui` — toolbar strippen
**Bestanden:** `korfbal-tool-bar.tsx`, `admin-settings.tsx`, `admin-nav.tsx`, `index.ts`

- `KorfbalToolBar`: `user`-prop en alles wat eraan hangt weg — dropdown, "Mijn gegevens", "Mijn club",
  "Uitloggen", "Inloggen", "Account aanmaken", `handleLogout`. Props worden `{ apps, homeHref, className }`.
- App-links waren verstopt achter `user &&`; die conditie vervalt zodat ze altijd tonen.
- Mobiel menu houdt alleen de app-lijst.
- `admin-settings.tsx` en `admin-nav.tsx` verwijderen, exports uit `index.ts`.
- Ongebruikte imports (`lucide-react` iconen, `User`-type) opruimen.

**Verify:** `pnpm --filter @korfbaltools/ui typecheck` slaagt; geen verwijzing meer naar `AdminSettings`.

### 2. `apps/main` — auth-code verwijderen
**Verwijderen:**
- Pagina's: `login/`, `register/`, `account/`, `forgot-password/`, `reset-password/`, `verify-email/`,
  `under-construction/`
- API-routes: `api/login`, `api/logout`, `api/register`, `api/forgot-password`, `api/reset-password`,
  `api/resend-verification`, `api/verify-email`, `api/me`, `api/me/pending-club`, `api/clubs`,
  `api/settings`, hele `api/admin/`
- Lib: `session.ts`, `session-cookie.ts`, `password.ts`, `reset-token.ts`, `verification-token.ts`,
  `rate-limit.ts`, `resend.ts`, `user-mapper.ts`
- `emails/` (alle drie de templates)

**Aanpassen:**
- `require-user.ts` wordt vervangen door `lib/club-context.ts`: één helper die `DEFAULT_CLUB_ID` leest en
  `{ clubId }` of een foutrespons teruggeeft. Alle `requireVastspelen()`- en `requireClubManager()`-aanroepen
  in `api/vastspelen/*` en `api/mijn-club/*` gaan hierop over.
- `layout.tsx`: `getSessionUser()` en `<AdminSettings>` eruit, `<KorfbalToolBar apps={apps} />`.
- `middleware.ts`: maintenance-mode-blok weg (die stond in de admin-UI), auth-redirects weg. Wat overblijft
  is één check: is de aangevraagde app-route ingeschakeld? Zo niet → `notFound()`/404.

**Verify:** `pnpm --filter main typecheck && pnpm --filter main build`.

### 3. `apps/main/src/lib/apps.ts` — bron van app-config
- `APP_ROUTES` uitbreiden met `scoreformulier`.
- Titels en afbeeldingen komen niet meer uit `AppConfig` (die tabel werd door de admin-UI gevuld), maar uit
  een constante in dit bestand.
- Nieuwe `isAppEnabled(capability)` leest `APP_<NAAM>_ENABLED`.
- `getNavApps()` verliest de `user`-parameter en filtert alleen nog op ingeschakelde apps.
- `api/apps/route.ts` roept `getNavApps()` zonder gebruiker aan.

**Verify:** `/api/apps` geeft precies de apps terug die in `.env` op `true` staan.

### 4. `apps/main/src/app/page.tsx` — homepage
- `getSessionUser()` en de `prisma.appConfig`-query eruit; tegels komen uit `lib/apps.ts`.
- "Welkom terug"-blok, "Account aanmaken"- en "Inloggen"-knoppen weg (drie plekken).
- Uitgeschakelde apps verdwijnen van de pagina in plaats van als "Binnenkort" met slotje te tonen.
- Copy die over accounts/inloggen gaat herschrijven: de "Hoe het werkt"-stappen en de sectie
  "Eén account, alle tools voor je club" kloppen niet meer.

**Verify:** homepage laden zonder cookie; alleen ingeschakelde apps zichtbaar, nergens inlog-tekst.

### 5. `apps/main/src/app/mijn-club` — achter toggle
- `page.tsx`: `getSessionUser()` vervangen door de club-context-helper; `notFound()` als
  `APP_MIJN_CLUB_ENABLED` niet `true` is.

**Verify:** met toggle uit geeft `/mijn-club` een 404.

### 6. `apps/admin` verwijderen
- Map `apps/admin/` weg.
- `/admin`-rewrites uit `apps/main/next.config.mjs` en `apps/main/vercel.json`.
- `vercel.json` krijgt de scoreformulier-rewrite die er nog niet in staat.
- Controleren of `turbo.json` / `pnpm-workspace.yaml` de app expliciet noemen.

**Verify:** `pnpm install && pnpm build` op de root slaagt.

### 7. `apps/teamindeling` en `apps/vastspelen` — layouts opschonen
- `getCurrentUser()` en `<AdminSettings>` uit beide `layout.tsx`; alleen `getNavApps()` blijft.
- `getCurrentUser()` uit beide `lib/main-api.ts`.
- `apps/vastspelen/src/lib/require-teamleider.ts` verwijderen; de vier pagina's die het aanroepen
  (`page.tsx`, `spelers`, `wedstrijden`, `wedstrijden/[id]`, `opstelling-check`) verliezen die aanroep.
- `apps/vastspelen/src/app/unauthorized/page.tsx` verwijderen.
- `apps/scoreformulier/src/app/layout.tsx` krijgt de toolbar, zodat alle apps dezelfde nav hebben.

**Verify:** `pnpm typecheck` over de hele workspace.

### 8. `packages/types` opruimen
- Weg: `schemas/login.ts`, `schemas/register.ts`, `schemas/auth-flows.ts`, `schemas/profile.ts`,
  `schemas/admin.ts`, `schemas/club-request.ts`, `role.ts`, `user.ts`, `audit-log.ts`,
  `app-config.ts`, `platform-settings.ts`.
- `Capability` verhuist naar een eigen bestand of blijft in `app-config.ts` — het wordt nog gebruikt als
  app-sleutel in `lib/apps.ts`.
- Blijven: `club.ts`, `team.ts`, `player.ts`, `vastspelen.ts`, `schemas/vastspelen.ts`,
  `schemas/mijn-club.ts`, `api-error.ts`.

**Verify:** `pnpm --filter @korfbaltools/types build` en de hele workspace-typecheck.

### 9. Dependencies opruimen
- Uit `apps/main/package.json`: `resend`, `react-email`/`@react-email/*`, en de wachtwoord-hashlibrary —
  na stap 2 nergens meer gebruikt. (Precieze namen check ik bij uitvoering.)
- `pnpm install` om de lockfile bij te werken.

**Verify:** `pnpm build` slaagt na het opschonen.

### 10. Documentatie bijwerken
- `PRODUCT.md`, `DESIGN.md`, `docs/plan.md`, `TODO.MD` beschrijven allemaal het accountmodel, rollen en de
  admin-app. Secties over auth/rollen/capabilities/admin herschrijven naar het nieuwe model.

## Wat expliciet blijft staan

- Alle Prisma-modellen, inclusief `User`, `Session`, `AuditLog`, `AppConfig`, `PlatformSettings`.
  Ongebruikt, maar geen migratie en geen dataverlies.
- Alle bedrijfslogica in `packages/vastspelen-logic` en `packages/scoreformulier-logic`.
- De vastspelen- en mijn-club-functionaliteit zelf; die staat alleen uit.

## Volgorde en controlepunten

1. `packages/ui` → typecheck
2. `apps/main` auth eruit → typecheck + build
3. `lib/apps.ts` + homepage + middleware → handmatig `/` en `/api/apps` controleren
4. `apps/admin` weg + rewrites → root build
5. Overige apps + types + dependencies → `pnpm build && pnpm typecheck && pnpm test`
6. Docs

## Risico's

- **Grote diff.** Ongeveer 60 bestanden weg, 25 aangepast. Reviewen per stap, niet in één keer.
- **Geen enkele toegangscontrole meer.** Vastspelen- en mijn-club-data zijn bewerkbaar door elke bezoeker
  zodra die apps aan staan. Daarom staan ze standaard uit.
- **Productie-rewrites.** `vercel.json` verwijst naar `korfbaltools-admin.vercel.app`; die deployment moet
  na het mergen ook echt weg, anders blijft er een losse admin-URL bereikbaar met een kapotte `/api/me`.
