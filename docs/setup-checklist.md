# Korfbaltools.nl – Setup Stappenplan

Praktisch stappenplan om de huls uit [plan.md](./plan.md) daadwerkelijk op te zetten: accounts aanmaken, koppelen en configureren. Volg de volgorde — latere stappen hebben vaak eerdere nodig (bv. Vercel-project heeft de GitHub-repo nodig).

---

## 1. Accounts aanmaken

- [ ] GitHub — repository/organisatie voor de monorepo
- [ ] Vercel — team account, gekoppeld aan GitHub
- [ ] Supabase — voor de Postgres database
- [ ] Resend — voor transactional e-mail (wachtwoord reset)
- [ ] Domeinregistrar — controleer dat je toegang hebt tot de DNS-instellingen van `korfbaltools.nl`

> Upstash (rate limiting) en Sentry (monitoring) zijn niet nodig voor een werkend platform — zie sectie 12 "Later (na livegang)".

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
- [ ] Schema opzetten: `User`, `Club`, `AuditLog` (zie plan.md sectie 7)
- [ ] Eerste migratie draaien (`prisma migrate dev`)

---

## 4. Auth (NextAuth / Auth.js)

- [ ] `NEXTAUTH_SECRET` genereren (`openssl rand -base64 32`)
- [ ] NextAuth installeren in `apps/main`, Prisma-adapter koppelen aan `packages/db`
- [ ] Database sessions configureren (niet JWT)
- [ ] Sessioncookie-config: `domain` alleen instellen op `.korfbaltools.nl` in productie (zie plan.md sectie 5)

---

## 5. Vercel projecten

- [ ] Vercel-project **main** aanmaken, root directory `apps/main`
- [ ] Vercel-project **admin** aanmaken, root directory `apps/admin`
- [ ] Voor elk project: "Ignored Build Step" instellen op `npx turbo-ignore`
- [ ] Voor elk project: environment variables invullen (zie tabel in sectie 11 hieronder)
- [ ] Preview-deployments testen door een PR te openen

---

## 6. Domein & DNS

- [ ] `korfbaltools.nl` als custom domain toevoegen aan het **main**-Vercel-project
- [ ] DNS-records instellen bij je registrar zoals Vercel aangeeft (meestal een `A`/`ALIAS`-record voor het apex-domein of een `CNAME` voor `www`)
- [ ] SSL-certificaat laten uitgeven (gebeurt automatisch via Vercel, kan even duren na DNS-wijziging)
- [ ] `admin` en overige tool-apps blijven op hun `*.vercel.app`-domein — geen custom domain nodig, ze zijn alleen bereikbaar via de rewrite vanuit main

---

## 7. E-mail (Resend)

- [ ] Resend-account aanmaken, API key genereren
- [ ] Verzenddomein verifiëren (bv. `mail.korfbaltools.nl`) via de DNS-records die Resend aangeeft (SPF/DKIM)
- [ ] `RESEND_API_KEY` toevoegen aan `apps/main` environment variables
- [ ] Testmail versturen om verificatie te bevestigen

---

## 8. CI/CD (GitHub Actions)

- [ ] `.github/workflows/ci.yml` aanmaken: draait `turbo lint typecheck test` op elke PR
- [ ] Turborepo Remote Cache token als GitHub secret toevoegen (`TURBO_TOKEN`, `TURBO_TEAM`)
- [ ] Vercel Git-integratie controleren: preview-deploy per PR, productie-deploy bij merge naar `main`

---

## 9. Environment variables overzicht

| Variabele | `apps/main` | `apps/admin` | Overige tool-apps |
|---|---|---|---|
| `DATABASE_URL` | ✅ | ❌ | ❌ |
| `NEXTAUTH_SECRET` | ✅ | ❌ | ❌ |
| `RESEND_API_KEY` | ✅ | ❌ | ❌ |
| `ADMIN_APP_URL` (voor lokale rewrite) | ✅ | — | — |

Alleen `apps/main` praat rechtstreeks met database/e-mail — zie plan.md sectie 10.

---

## 10. Lokale development

- [ ] `.env.local` per app aanmaken (nooit committen — check `.gitignore`)
- [ ] Poorten afspreken: `apps/main` op 3000, `apps/admin` op 3001
- [ ] `apps/main` lokaal laten rewriten naar `http://localhost:3001` i.p.v. het productie `*.vercel.app`-adres
- [ ] `turbo dev` draaien vanuit de root en controleren dat login + sessie werkt tussen de apps op localhost

---

## 11. Laatste check vóór livegang

- [ ] Alle environment variables gecontroleerd in Vercel (main + admin, production én preview)
- [ ] Eerste admin-account handmatig aangemaakt/gepromoveerd in de database (`role: "admin"`)
- [ ] Registratie- en resetflow end-to-end getest (inclusief e-mail-ontvangst)

---

## 12. Later (na livegang, optioneel)

Niet nodig voor een werkend platform, maar aan te raden zodra er echt gebruikers/traffic zijn — zie plan.md sectie 12.

### Rate limiting (Upstash)

- [ ] Upstash-account aanmaken, Redis-database aanmaken (kies regio dicht bij je Vercel-functies)
- [ ] `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` kopiëren, toevoegen aan `apps/main` environment variables
- [ ] `@upstash/ratelimit` + `@upstash/redis` installeren in `apps/main`
- [ ] Testen: herhaalde login-pogingen worden na X keer geblokkeerd
- [ ] Alternatief: check eerst of Vercel's eigen Firewall/rate-limiting (Pro-plan) al voldoet, dan is Upstash mogelijk niet nodig

### Monitoring (Sentry)

- [ ] Sentry-account aanmaken, projecten aanmaken voor `apps/main` en `apps/admin`
- [ ] Sentry SDK installeren en initialiseren in beide apps (`npx @sentry/wizard@latest -i nextjs`)
- [ ] DSN's toevoegen aan de respectievelijke environment variables
- [ ] Test-error triggeren om te bevestigen dat meldingen binnenkomen
