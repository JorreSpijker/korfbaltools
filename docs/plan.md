# Korfbaltools.nl – Architectuur & Bouwplan

## 1. Overzicht

Korfbaltools.nl wordt een platform met meerdere losse tools voor korfbal. **Welke tools er precies komen staat nog niet vast** (denk aan teamindeling, statistieken, training, planning). Dit plan beschrijft daarom eerst de **huls**: het platform-fundament (auth, admin, monorepo, deployment) waar elke toekomstige tool op aansluit, plus het recept om een nieuwe tool toe te voegen zodra die gekozen wordt (sectie 9).

Wel al vast onderdeel van de huls:
- admin paneel (gebruikersbeheer — alleen zichtbaar/toegankelijk voor admins)

De code leeft in één **monorepo (Turborepo + pnpm workspaces)**. Elke tool blijft wel een eigen Vercel-deployment, zodat tools onafhankelijk van elkaar releasen — alleen de broncode en gedeelde packages zitten samen in één repo.

De site bestaat uit:
- één hoofdplatform (korfbaltools.nl)
- meerdere losse tool-apps (elk een eigen Vercel deployment, gebouwd vanuit dezelfde monorepo)
- gedeelde login via één centrale auth-omgeving
- gedeelde code (types, config) via interne packages

---

## 2. Doelarchitectuur

### Monorepo structuur

Let op: `apps/`, `packages/`, `turbo.json`, `pnpm-workspace.yaml` en het root `package.json` komen in de **hoofdmap van de `korfbaltools`-repository** (dus naast `docs/`, niet erin). De `docs/`-map bevat alleen documentatie (dit plan, de setup-checklist) en bevat zelf geen code.

```
korfbaltools/                  (repo root = Turborepo root)
├── apps/
│   ├── main/                  → korfbaltools.nl
│   │   - homepage
│   │   - dashboard
│   │   - auth (login / session)
│   │   - api (user + session endpoints)
│   │   - rewrites naar tools
│   ├── admin/                   → admin.vercel.app (alleen voor role "admin")
│   └── <tool>/                  (nog niet vastgesteld — zie sectie 9 "Nieuwe tool toevoegen")
├── packages/
│   ├── types/                  → gedeelde TypeScript types (User, Role, ...)
│   ├── config/                 → gedeelde eslint/tsconfig/tailwind config + design tokens (kleuren, fonts)
│   ├── db/                     → Prisma schema + client (Supabase Postgres)
│   └── ui/                     (toekomstig — gedeelde componenten)
├── docs/                       → alleen documentatie (dit plan, setup-checklist.md), geen code
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Tooling

- **pnpm** als package manager (workspaces)
- **Turborepo** voor task orchestration (build, lint, dev, test) en remote caching
- **TypeScript** overal — apps én packages
- Elke `apps/*` blijft een zelfstandige Next.js app die los op Vercel deployt
- **Node.js 20 LTS**, vastgelegd via `engines` in `package.json` + `.nvmrc`

### Styling

- **Tailwind CSS** als styling-basis in beide apps
- `packages/config` bevat gedeelde design tokens (kleuren, fonts, spacing), gebaseerd op de Roku design skill — dit is de gemeenschappelijke merkidentiteit
- `apps/main` (korfbaltools.nl) gebruikt de [Roku design skill](https://www.typeui.sh/design-skills/roku) rechtstreeks als stijlgids/component-aanpak
- `apps/admin` gebruikt [shadcn/ui](https://ui.shadcn.com/), maar geconfigureerd met dezelfde tokens uit `packages/config` — zo blijft de merkidentiteit doorlopen ook al is de admin-UI functioneel van aard
- Geen dark mode voor nu — makkelijk later toe te voegen, Tailwind/shadcn ondersteunen het al van zichzelf

### Formulieren & validatie

- **react-hook-form** voor form-state in de client (registratieformulier, admin user-forms)
- **zod** voor schema-validatie — dezelfde schema's worden zowel client-side (in het formulier) als server-side (API-input) gebruikt, en leveren de 422-validatiefouten uit de API-conventies (sectie 8)
- schema's leven in `packages/types`

### Data fetching

- **Native fetch**, geen extra library (voor nu) — bewuste keuze om de huls simpel te houden
- makkelijk later te vervangen door TanStack Query zodra bv. de admin user-tabel complexer wordt (caching, optimistic updates)

---

## 3. Routing tussen apps (Vercel Rewrites)

De hoofdapp fungeert als "gateway". Dit verandert niet door de monorepo — het is puur een gevolg van dat elke app een eigen Vercel-deployment blijft.

### Voorbeeld `vercel.json` (apps/main)

```json
{
  "rewrites": [
    {
      "source": "/admin/:path*",
      "destination": "https://admin.vercel.app/:path*"
    }
  ]
}
````

Zodra een nieuwe tool wordt gekozen en toegevoegd (bv. `/teamindeling`), komt er een vergelijkbare rewrite-regel bij — zie sectie 9, "Nieuwe tool toevoegen".

### Gedrag

* gebruiker blijft op `korfbaltools.nl/teamindeling`
* content komt van aparte Vercel deployment
* voelt als één geïntegreerde website

---

## 4. Auth strategie (Optie A – Centrale login in main app)

### Concept

* Login gebeurt alleen in `apps/main` (korfbaltools.nl)
* Session wordt opgeslagen via cookies op `.korfbaltools.nl`
* Alle tools vertrouwen op centrale API voor user info

### Registratie

* Open zelf-registratie: iedereen kan een account aanmaken met email + wachtwoord (`POST /api/register`, zie sectie 8)
* Nieuwe accounts krijgen standaard `role: "player"` en geen `clubId`
* Een admin kan achteraf de rol en club van een gebruiker aanpassen via het admin paneel (sectie 9)
* E-mailverificatie vóór een account volledig actief is: zie sectie 12 (toekomstige uitbreiding)

### Club-hierarchie (platformniveau)

* Voor nu: één platform-brede `admin`-rol, geen aparte "club-admin". Een admin beheert alle users en clubs, platformbreed
* `clubId` op de User is puur ter identificatie/filtering, geen aparte autorisatie-laag
* Uitbreidbaar naar club-scoped admins later (zie sectie 12) zonder dat het datamodel hoeft te veranderen — de rol-check zou dan `clubId` erbij betrekken

### Rolgebaseerde toegang (admin paneel)

* `apps/admin` is alleen bruikbaar voor gebruikers met `role === "admin"`
* Toegang wordt op twee plekken gecontroleerd (defense in depth):
  1. **Main app (gateway)**: de rewrite/link naar `/admin` wordt alleen getoond en doorgelaten als de ingelogde user admin is (check via session in middleware van `apps/main`)
  2. **Admin app zelf**: elke pagina/API-call in `apps/admin` valideert opnieuw de rol via `/api/me`, zodat de app niet blind vertrouwt op de gateway
* Niet-admins die direct naar `admin.vercel.app` navigeren krijgen een 403 / redirect, ongeacht de main-app rewrite

---

## 5. Auth implementatie

### Aanbevolen technologie

* NextAuth.js (Auth.js)
* Database sessions (i.p.v. JWT), zodat een admin een sessie serverside kan intrekken (bv. bij rol-wijziging of account-deactivatie)

---

### Database & ORM

* **Prisma** als ORM, schema + client in `packages/db`
* **Supabase (Postgres)** als hosting
* Alleen `apps/main` praat rechtstreeks met de database — tool-apps (incl. admin) gaan altijd via de main API, nooit direct naar `packages/db`

---

### E-mail (wachtwoord reset)

* **Resend** voor het versturen van transactional e-mails (reset-links)
* Templates met React Email, verstuurd vanuit een API route in `apps/main` (dezelfde plek die ook de admin-endpoints host)

---

### Session cookie setup

Belangrijk: cookie moet geldig zijn voor alle subroutes/apps.

```ts
cookies: {
  sessionToken: {
    name: "__Secure-session",
    options: {
      domain: ".korfbaltools.nl",
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    }
  }
}
```

---

## 6. Auth flow

### Login flow

1. gebruiker logt in op `korfbaltools.nl/login`
2. NextAuth creëert session cookie
3. cookie is beschikbaar op hele domein
4. gebruiker kan tools gebruiken zonder opnieuw inloggen

---

### Tool-app flow (bijv. teamindeling)

1. gebruiker opent `/teamindeling`
2. app draait op aparte Vercel deployment (vanuit `apps/teamindeling`)
3. app vraagt user info op via main API:

```ts
fetch("https://korfbaltools.nl/api/me", {
  credentials: "include"
})
```

4. main app valideert session en returnt user

---

### Server-side aanroepen tussen apps

* **Client-side** fetches (`/api/me` vanuit de browser) lopen via de rewrite altijd same-origin (`korfbaltools.nl`), dus de sessioncookie wordt automatisch meegestuurd
* **Server-side** aanroepen (bv. een SSR-pagina of API route in `apps/teamindeling`/`apps/admin` die zelf naar `apps/main` fetcht) lopen niet via de browser: `credentials: "include"` heeft daar geen effect. De inkomende `Cookie`-header moet dan expliciet worden doorgegeven aan de fetch naar de main API

---

## 7. Data-architectuur

### User model (start eenvoudig)

Gedefinieerd in `packages/types` en gedeeld door alle apps.

* id
* email
* naam (optioneel)
* role (future-proof)
  * admin
  * coach
  * player
  * referee
* clubId (optioneel — verwijst naar Club, zie hieronder)
* capabilities
  * teamplanner
  * statistieken
* passwordHash (indien credentials-login; nooit het plaintext wachtwoord opslaan of tonen)

### Club model (start eenvoudig)

* id
* naam
* (later) adres, logo, etc.

Voor nu beheert één platform-brede admin alle clubs (zie sectie 4, "Club-hierarchie"). Geen per-club rechten totdat dat nodig is.

### AuditLog model (admin paneel)

* id
* actorId (welke admin de actie uitvoerde)
* action (bv. `role_changed`, `password_reset`, `user_deleted`)
* targetUserId
* metadata (bv. oude/nieuwe rol)
* createdAt

---

## 8. API design (main app)

### Basis endpoints

```
POST /api/register
→ nieuw account aanmaken (email + wachtwoord), default role "player"

GET /api/me
→ huidige user

POST /api/login (via NextAuth)

POST /api/logout
```

### API-conventies

* Elke error volgt hetzelfde formaat: `{ error: { code: string, message: string } }`
* Standaard HTTP-statuscodes: 401 (niet ingelogd), 403 (geen rechten), 404 (niet gevonden), 422 (validatiefout — via zod-schema's uit `packages/types`, zie sectie 2 "Formulieren & validatie")
* Geen API-versionering totdat er een breaking change nodig is — alle apps draaien immers vanuit dezelfde monorepo tegen dezelfde main API, dus versionering wordt pas relevant zodra externe partijen de API gebruiken

### Admin endpoints (alleen toegankelijk voor role "admin")

```
GET /api/admin/users
→ lijst van alle gebruikers

PATCH /api/admin/users/:id
→ rol wijzigen (bv. { role: "coach" })

POST /api/admin/users/:id/reset-password
→ nieuw (tijdelijk) wachtwoord instellen of reset-link versturen

DELETE /api/admin/users/:id
→ gebruiker verwijderen/deactiveren
```

Elke admin-endpoint controleert server-side dat de ingelogde user `role === "admin"` heeft, los van wat de frontend toont. Elke admin-actie (rol wijzigen, wachtwoord resetten, verwijderen) schrijft automatisch een regel weg in de `AuditLog` (zie sectie 7).

---

## 9. Tool-apps (workspaces in de monorepo)

Elke tool is:

* een eigen workspace onder `apps/*` in de monorepo (geen los repo meer)
* een eigen Vercel deployment
* geen eigen auth systeem
* afhankelijk van main API
* gebruikt gedeelde code uit `packages/types` en `packages/config`

### Nieuwe tool toevoegen (patroon)

Welke tools er precies komen staat nog niet vast. Zodra er een gekozen wordt, is dit het recept:

1. Nieuwe workspace `apps/<tool>` aanmaken (Next.js, gebruikt `packages/types`/`packages/config`)
2. Eigen Vercel-project koppelen (root directory `apps/<tool>`)
3. Rewrite toevoegen in de `vercel.json` van `apps/main` (sectie 3)
4. Tool haalt user/club-data op via de main API (`/api/me`) — beheert nooit eigen userdata
5. Indien nodig: nieuwe capability op het User-model (sectie 7) om toegang tot de tool aan te zetten per gebruiker

### Voorbeeld: admin app (`apps/admin`)

* alleen zichtbaar/toegankelijk voor `role === "admin"` (zie sectie 4, "Rolgebaseerde toegang")
* UI gebouwd met [shadcn/ui](https://ui.shadcn.com/) (tabellen, forms, dialogs — past goed bij een data-zwaar admin paneel), gestyled met de gedeelde design tokens uit `packages/config` zodat de merkidentiteit van korfbaltools.nl doorloopt
* gebruikersbeheer:
  * overzicht van alle gebruikers (naam, email, rol, club)
  * rol wijzigen (admin / coach / player / referee)
  * wachtwoord resetten (nieuw tijdelijk wachtwoord of reset-link, nooit het bestaande wachtwoord tonen)
  * gebruiker deactiveren/verwijderen
  * audit log inzien (wie deed wat, wanneer)
* praat uitsluitend met de admin-endpoints van de main API (sectie 8) — beheert geen eigen userdata

---

## 10. Deployment op Vercel

### Vercel monorepo setup

* Eén GitHub repo, meerdere Vercel-projecten — één per app
* Elk Vercel-project heeft zijn **Root Directory** ingesteld op de bijbehorende `apps/*` map (bv. `apps/teamindeling`)
* `turbo-ignore` als "Ignored Build Step" zodat een Vercel-project alleen rebuildt als er daadwerkelijk iets veranderde in die app of zijn dependencies (`packages/*`)
* Turborepo remote caching (Vercel Remote Cache) versnelt herhaalde builds tussen apps

### CI/CD

* GitHub Actions draait bij elke PR: lint, typecheck en test via `turbo lint typecheck test` (met remote caching, dus alleen gewijzigde apps/packages worden echt gecontroleerd)
* Vercel maakt automatisch preview-deployments per PR, per app (dankzij de losse Vercel-projecten)
* Merge naar `main` triggert een productie-deploy van elke gewijzigde app

### Monitoring

* Voor nu: Vercel's eigen Runtime Logs voor basis request-/error-inzicht — voldoende zolang er weinig traffic is
* Sentry toevoegen is een toekomstige uitbreiding zodra er echt gebruikers op zitten (zie sectie 12)

### Lokale development

* Elke app draait lokaal op een eigen poort (bv. `apps/main` op 3000, `apps/admin` op 3001)
* De sessioncookie krijgt `domain: ".korfbaltools.nl"` alleen in productie; in development wordt dit weggelaten zodat de cookie gewoon op `localhost` werkt
* `apps/main` rewrit lokaal niet naar `*.vercel.app`, maar naar `http://localhost:<poort>` van de betreffende tool-app (via een env var per tool, bv. `ADMIN_APP_URL`)
* `turbo dev` start alle apps tegelijk vanuit de root

### Environment variables & secrets

* Elk Vercel-project (main, teamindeling, admin, statistieken) heeft zijn eigen environment variables ingesteld in het Vercel-dashboard
* Secrets die met de database/auth/e-mail te maken hebben (`DATABASE_URL`, `NEXTAUTH_SECRET`, cookie domain, `RESEND_API_KEY`) staan alléén in `apps/main`, want alleen main praat rechtstreeks met database en e-mail-provider
* Tool-apps hebben geen `DATABASE_URL` nodig — enkel de main API-url als env var (indien ze die niet relatief kunnen benaderen via de rewrite)

### Main app

* `apps/main` → korfbaltools.nl (custom domain)

### Tool apps

* `apps/admin` → admin.vercel.app (rolgebaseerde toegang, alleen admins)
* Overige tools: nog niet vastgesteld — zie sectie 9, "Nieuwe tool toevoegen"

Alle tool routes worden via rewrites gekoppeld (zie sectie 3).

---

## 11. Schaalbaarheid (belangrijk)

### Wat dit ontwerp al ondersteunt:

* nieuwe tools toevoegen als nieuwe `apps/*` workspace, zonder impact op main app
* losse Vercel-deployments per tool — onafhankelijk releasen blijft mogelijk
* centrale login blijft stabiel
* gedeelde types/config voorkomen duplicatie en drift tussen tools
* Turborepo caching houdt CI/build-tijd laag naarmate er meer apps bijkomen

---

## 12. Toekomstige uitbreiding (optioneel)

### Mogelijke upgrades later

#### 1. Club-scoped admin rollen

* per-club beheerders i.p.v. één platform-brede admin-rol
* nodig zodra clubs echt onafhankelijk van elkaar moeten kunnen werken

#### 2. Volledige AVG-flow

* ouderlijke toestemming voor minderjarige leden
* recht op vergetelheid / data-export op aanvraag
* privacyverklaring + expliciete consent bij registratie
* concrete bewaartermijnen per gegevenstype

Nu al vastgelegd als basisprincipe (sectie 4/7): dataminimalisatie en dat een admin altijd ziet/beheert wie welke data heeft. De volledige flow (consent-UI, juridische tekst) vereist afstemming met een jurist vóór livegang.

#### 3. E-mailverificatie bij registratie

#### 4. Dark mode

* Tailwind/shadcn ondersteunen dit al van zichzelf; vooral een kwestie van tokens + toggle toevoegen

#### 5. Rate limiting (Upstash)

* **Upstash Redis** + `@upstash/ratelimit` op `/api/register`, `/api/login` en de reset-password endpoints
* Voorkomt brute-force pogingen op wachtwoorden en misbruik van open registratie/reset-e-mails
* Niet blokkerend voor een werkend platform, maar wel aan te raden zodra er echt traffic/gebruikers zijn. Alternatief: Vercel's eigen Firewall/rate-limiting (Pro-plan), dan is Upstash mogelijk niet eens nodig

#### 6. Monitoring (Sentry)

* Error tracking met stack traces en alerting, geïntegreerd in `apps/main` en `apps/admin`
* Tot die tijd voldoen Vercel's eigen Runtime Logs voor basis-inzicht

#### 7. Gedeelde UI package (`packages/ui`)

* herbruikbare componenten (buttons, forms, layout) gedeeld tussen main app en tools
* voorkomt visuele inconsistentie tussen tools

#### 8. Centrale auth subdomain

```
auth.korfbaltools.nl
```

#### 9. API gateway laag / API-versionering

* central backend voor alle tools, relevant zodra externe partijen de API gebruiken

---

## 13. MVP bouwvolgorde

### Stap 1 – Monorepo foundation

* Turborepo + pnpm workspace opzetten (`apps/`, `packages/`)
* `packages/types` en `packages/config` aanmaken (basis types, gedeelde eslint/tsconfig)
* Supabase-project aanmaken + `packages/db` opzetten (Prisma schema + client: User, Club)
* `packages/config` opzetten met Tailwind config + gedeelde design tokens (kleuren, fonts) op basis van de Roku design skill
* `apps/main`: Next.js app op korfbaltools.nl met basis layout + homepage, opgezet volgens de Roku design skill
* Vercel-project voor `apps/main` koppelen (root directory `apps/main`)
* Lokale dev-setup (poorten per app, cookie-domain per omgeving, `turbo dev`)

### Stap 2 – Auth & registratie

* NextAuth installeren in `apps/main` met database sessions via `packages/db`
* open zelf-registratie (`/api/register`) + login + session (`/api/me`)

### Stap 3 – Admin paneel

* `apps/admin` toevoegen als nieuwe workspace, shadcn/ui installeren en initialiseren met de design tokens uit `packages/config`
* `AuditLog` model toevoegen aan `packages/db`
* admin-endpoints bouwen in `apps/main` (`/api/admin/users`, rol wijzigen, wachtwoord resetten — elk met audit log entry)
* Resend integreren voor het versturen van reset-links
* rolcontrole toevoegen: middleware in `apps/main` (gateway) + check in `apps/admin` zelf
* eigen Vercel-project (root directory `apps/admin`) + rewrite integratie vanuit main app, alleen zichtbaar voor admins

### Stap 4 – Platform-hardening

* CI/CD opzetten (GitHub Actions: lint/typecheck/test via turbo, preview-deploys per PR)
* API-conventies vastleggen (error-formaat, statuscodes — zie sectie 8)

### Stap 5 – Eerste echte tool (zodra gekozen)

* nieuwe workspace toevoegen volgens het patroon in sectie 9
* `packages/ui` overwegen zodra er visuele duplicatie ontstaat tussen tools

---

## 14. Belangrijk ontwerpprincipe

* Main app = "identity + gateway"
* Tool apps = "functional modules", elk een eigen deployment binnen dezelfde monorepo
* Auth = altijd centraal
* Data = via API, nooit direct tussen apps
* Gedeelde code (types, config) = via `packages/*`, nooit gekopieerd tussen apps
* Rolgebaseerde tools (zoals admin) = altijd server-side gevalideerd, nooit alleen client-side verborgen
* Persoonsgegevens = dataminimalisatie vanaf dag 1, ook al is de volledige AVG-flow pas later uitgewerkt (sectie 12)
* Welke tools er komen staat los van de huls — nieuwe tools volgen het vaste patroon in sectie 9, zonder het fundament aan te passen

---
