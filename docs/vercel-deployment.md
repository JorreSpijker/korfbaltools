# Vercel Deployment — Step by Step

Companion to [setup-checklist.md](./setup-checklist.md) section 5, for the 4 current apps (`main`,
`teamindeling`, `vastspelen`, `scoreformulier`).

Do main first (owns the DB), then the tool apps.

---

## 0. Prereqs

- [ ] Repo pushed to GitHub
- [ ] Postgres DB ready (Supabase), `DATABASE_URL` + `DIRECT_URL` in hand

---

## 1. Vercel project: main

- [ ] Add New → Project → import the GitHub repo
- [ ] **Root Directory**: `apps/main`
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build command: leave default (`next build`) — Vercel auto-detects the pnpm workspace via `pnpm-workspace.yaml`
- [ ] Environment variables:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXT_PUBLIC_APP_URL` = `https://korfbaltools.nl` (production)
  - `APP_TEAMINDELING_ENABLED` / `APP_SCOREFORMULIER_ENABLED` / `APP_VASTSPELEN_ENABLED` /
    `APP_STATISTIEKEN_ENABLED` / `APP_MIJN_CLUB_ENABLED` — `"true"` zet een app aan, al het andere zet hem
    uit (zie [apps/main/src/lib/apps.ts](../apps/main/src/lib/apps.ts))
  - `DEFAULT_CLUB_ID` — alleen nodig als `vastspelen` of `mijn-club` aan staat; die data is club-gescoped
  - leave `TEAMINDELING_APP_URL` / `VASTSPELEN_APP_URL` / `SCOREFORMULIER_APP_URL` unset in production —
    those are dev-only overrides (see [apps/main/next.config.mjs](../apps/main/next.config.mjs)); prod
    routing goes through `vercel.json` rewrites instead
- [ ] Settings → Git → Ignored Build Step:
  ```
  npx turbo-ignore
  ```
- [ ] Deploy
- [ ] Settings → Domains → add `korfbaltools.nl`, follow DNS instructions from registrar

---

## 2. Run the production migration

`prisma migrate dev` (used locally) is dev-only. Nothing currently runs `migrate deploy` against production — do this once before real traffic, either manually or wired into the main project's build:

```bash
DATABASE_URL="<prod-url>" DIRECT_URL="<prod-direct-url>" \
  pnpm --filter @korfbaltools/db exec prisma migrate deploy
```

---

## 3. Vercel projects: the tool apps

Same recipe per app (`teamindeling`, `vastspelen`, `scoreformulier`):

- [ ] Add New → Project → same repo, new project
- [ ] **Root Directory**: `apps/<app>`
- [ ] Environment variable: `MAIN_APP_URL` = `https://korfbaltools.nl` (used for the shared toolbar's app list)
- [ ] Ignored Build Step: `npx turbo-ignore`
- [ ] Deploy, note the assigned domain (e.g. `korfbaltools-teamindeling.vercel.app`)

---

## 4. Wire rewrites in main

[apps/main/vercel.json](../apps/main/vercel.json) rewrites each tool path to its own deployment. Update the
domains there if they differ from the defaults:

```json
{
  "rewrites": [
    { "source": "/teamindeling", "destination": "https://<teamindeling-domain>/teamindeling" },
    { "source": "/teamindeling/:path+", "destination": "https://<teamindeling-domain>/teamindeling/:path+" }
  ]
}
```

Commit + push → main redeploys automatically.

A rewrite alone is not enough: main's middleware 404't een app-pad zolang de bijbehorende
`APP_<NAAM>_ENABLED` niet op `"true"` staat.

---

## 5. Verify

- [ ] `korfbaltools.nl` loads main
- [ ] `korfbaltools.nl/teamindeling` proxies to the teamindeling project
- [ ] An app whose toggle is off returns a 404 instead of proxying
- [ ] Preview deployments work by opening a PR (Vercel auto-creates one per project)
