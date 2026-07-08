# Vercel Deployment — Step by Step

Companion to [setup-checklist.md](./setup-checklist.md) section 5, updated for the 3 current apps (`main`, `admin`, `teamindeling`) and gaps found in the repo as of this writing (no teamindeling rewrite in prod `vercel.json`, no `prisma migrate deploy` step wired anywhere).

Do main first (owns the DB), then admin, then teamindeling.

---

## 0. Prereqs

- [ ] Repo pushed to GitHub
- [ ] Postgres DB ready (Supabase), `DATABASE_URL` + `DIRECT_URL` in hand
- [ ] Resend API key ready

---

## 1. Vercel project: main

- [ ] Add New → Project → import the GitHub repo
- [ ] **Root Directory**: `apps/main`
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build command: leave default (`next build`) — Vercel auto-detects the pnpm workspace via `pnpm-workspace.yaml`
- [ ] Environment variables:
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_APP_URL` = `https://korfbaltools.nl` (production)
  - leave `ADMIN_APP_URL` / `TEAMINDELING_APP_URL` unset in production — those are dev-only overrides (see [apps/main/next.config.mjs](../apps/main/next.config.mjs)); prod routing goes through `vercel.json` rewrites instead
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

## 3. Vercel project: admin

- [ ] Add New → Project → same repo, new project
- [ ] **Root Directory**: `apps/admin`
- [ ] Environment variable: `MAIN_APP_URL` = `https://korfbaltools.nl`
- [ ] Ignored Build Step: `npx turbo-ignore`
- [ ] Deploy, note the assigned domain (e.g. `korfbaltools-admin.vercel.app`)

---

## 4. Vercel project: teamindeling

Not yet covered by [setup-checklist.md](./setup-checklist.md) — that doc predates this app.

- [ ] Add New → Project → same repo, new project
- [ ] **Root Directory**: `apps/teamindeling`
- [ ] Framework preset: Vite (auto-detected)
- [ ] Ignored Build Step: `npx turbo-ignore`
- [ ] Deploy, note the assigned domain

---

## 5. Wire rewrites in main (gap: currently missing)

[apps/main/vercel.json](../apps/main/vercel.json) only rewrites `/admin/*` today. Add teamindeling using the real domains from steps 3–4:

```json
{
  "rewrites": [
    { "source": "/admin/:path*", "destination": "https://<admin-domain>/admin/:path*" },
    { "source": "/teamindeling", "destination": "https://<teamindeling-domain>/teamindeling/" },
    { "source": "/teamindeling/:path+", "destination": "https://<teamindeling-domain>/teamindeling/:path+" }
  ]
}
```

Commit + push → main redeploys automatically.

---

## 6. Verify

- [ ] `korfbaltools.nl` loads main
- [ ] `korfbaltools.nl/admin` proxies to the admin project (admin role only)
- [ ] `korfbaltools.nl/teamindeling` proxies to the teamindeling project
- [ ] Preview deployments work by opening a PR (Vercel auto-creates one per project)
