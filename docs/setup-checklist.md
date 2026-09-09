# Korfbaltools.nl – Setup Stappenplan

Praktisch stappenplan om de huls uit [plan.md](./plan.md) daadwerkelijk op te zetten: accounts aanmaken, koppelen en configureren. Volg de volgorde — latere stappen hebben vaak eerdere nodig (bv. Vercel-project heeft de GitHub-repo nodig).

---

## 1. Accounts aanmaken

- [ ] GitHub — repository/organisatie voor de monorepo
- [ ] Vercel — team account, gekoppeld aan GitHub
- [ ] Supabase — voor de Postgres database
- [ ] Domeinregistrar — controleer dat je toegang hebt tot de DNS-instellingen van `korfbaltools.nl`

> Sentry (monitoring) is niet nodig voor een werkend platform — zie sectie 12 "Later (na livegang)".

---

## 2. Repository & monorepo

- [ ] Nieuwe GitHub-repo aanmaken (bv. `korfbaltools`)
- [ ] `pnpm` installeren lokaal (`corepack enable` of via Node)
- [ ] Turborepo initialiseren (`pnpm dlx create-turbo@latest`) of handmatig opzetten met `apps/`, `packages/`, `turbo.json`, `pnpm-workspace.yaml`
- [ ] `.nvmrc` toevoegen met Node 20 LTS + `engines` in root `package.json`
- [ ] `packages/types`, `packages/config`, `packages/db` aanmaken als lege workspaces
- [ ] Turborepo Remote Cache inschakelen (`npx turbo login` + `npx turbo link`, koppelt aan je Vercel-team)

---

## 3. Database (Supabase + Prisma)

- [ ] Nieuw Supabase-project aanmaken (kies een regio dicht bij je gebruikers, bv. `eu-central-1`)
- [ ] Database-connectiestring (`DATABASE_URL`) uit Supabase-dashboard kopiëren (gebruik de **pooled** connection string voor serverless/Vercel)
- [ ] Prisma installeren in `packages/db` (`pnpm add -D prisma`, `pnpm add @prisma/client`)
- [ ] `prisma init` draaien, `DATABASE_URL` in `.env` zetten
- [ ] Schema opzetten: `Club`, `Team`, `Player` en de `Vastspelen*`-modellen (zie packages/db/prisma/schema.prisma)
- [ ] Eerste migratie draaien (`prisma migrate dev`)

---

## 4. Apps aan/uit zetten

Er is geen auth: elke bezoeker ziet hetzelfde. Wat er te zien is bepaal je per omgeving.

- [ ] Per app een `APP_<NAAM>_ENABLED` zetten in `apps/main` (`"true"` = aan, al het andere = uit)
- [ ] `DEFAULT_CLUB_ID` zetten als `vastspelen` of `mijn-club` aan staat — die data is club-gescoped
- [ ] Controleren dat een uitgeschakelde app een 404 geeft (afgevangen in `apps/main/src/middleware.ts`)

---

## 5. Vercel projecten

- [ ] Vercel-project **main** aanmaken, root directory `apps/main`
- [ ] Per tool-app een Vercel-project aanmaken, root directory `apps/<app>`
- [ ] Voor elk project: "Ignored Build Step" instellen op `npx turbo-ignore`
- [ ] Voor elk project: environment variables invullen (zie tabel in sectie 8 hieronder)
- [ ] Preview-deployments testen door een PR te openen

---

## 6. Domein & DNS

- [ ] `korfbaltools.nl` als custom domain toevoegen aan het **main**-Vercel-project
- [ ] DNS-records instellen bij je registrar zoals Vercel aangeeft (meestal een `A`/`ALIAS`-record voor het apex-domein of een `CNAME` voor `www`)
- [ ] SSL-certificaat laten uitgeven (gebeurt automatisch via Vercel, kan even duren na DNS-wijziging)
- [ ] De tool-apps blijven op hun `*.vercel.app`-domein — geen custom domain nodig, ze zijn alleen bereikbaar via de rewrite vanuit main

---

## 7. CI/CD (GitHub Actions)

- [ ] `.github/workflows/ci.yml` aanmaken: draait `turbo lint typecheck test` op elke PR
- [ ] Turborepo Remote Cache token als GitHub secret toevoegen (`TURBO_TOKEN`, `TURBO_TEAM`)
- [ ] Vercel Git-integratie controleren: preview-deploy per PR, productie-deploy bij merge naar `main`

---

## 8. Environment variables overzicht

| Variabele | `apps/main` | Tool-apps |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | ✅ | ❌ |
| `APP_<NAAM>_ENABLED` | ✅ | ❌ |
| `DEFAULT_CLUB_ID` | ✅ | ❌ |
| `<APP>_APP_URL` (alleen lokale rewrite) | ✅ | — |
| `MAIN_APP_URL` | ❌ | ✅ |

Alleen `apps/main` praat rechtstreeks met de database — zie plan.md sectie 10.

---

## 9. Lokale development

- [ ] `.env.local` per app aanmaken (nooit committen — check `.gitignore`)
- [ ] Poorten: `apps/main` 3000, `teamindeling` 3002, `vastspelen` 3003, `scoreformulier` 3004
- [ ] `apps/main` lokaal laten rewriten naar die localhost-poorten i.p.v. de productie `*.vercel.app`-adressen
- [ ] `turbo dev` draaien vanuit de root en controleren dat de toolbar in elke app dezelfde app-lijst toont

---

## 10. Laatste check vóór livegang

- [ ] Alle environment variables gecontroleerd in Vercel (alle projecten, production én preview)
- [ ] Per app gecontroleerd dat de toggle klopt: aan = bereikbaar, uit = 404

---

## 11. Later (na livegang, optioneel)

Niet nodig voor een werkend platform, maar aan te raden zodra er echt gebruikers/traffic zijn — zie plan.md sectie 12.

### Monitoring (Sentry)

- [ ] Sentry-account aanmaken, project aanmaken per app
- [ ] Sentry SDK installeren en initialiseren (`npx @sentry/wizard@latest -i nextjs`)
- [ ] DSN's toevoegen aan de respectievelijke environment variables
- [ ] Test-error triggeren om te bevestigen dat meldingen binnenkomen
