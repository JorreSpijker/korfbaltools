# "Mijn club" verhuist naar apps/main — design

## Aanleiding

"Mijn club" leefde tot nu toe in `apps/admin` (`/clubs/[id]`, hergebruikt van de admin-club-detailpagina, scoped via `requireClubManager`). Reden om te verhuizen: een clubbeheerder is een gewone user op korfbaltools.nl — die hoort niet via de apart gedeployde admin-app te moeten voor iets dat bij zijn normale account-ervaring past. Alleen de clubbeheerder-variant verhuist; platform-admins blijven volledig clubbeheer (naam/code bewerken, activeren/deactiveren, verwijderen) doen via `apps/admin`'s `/clubs/[id]`, dat teruggezet wordt naar zijn admin-only staat van vóór de Mijn-club-feature.

`apps/main` heeft geen bestaande Radix/shadcn-UI-laag (alleen plain HTML + Tailwind, zie `account-form.tsx`) — die wordt hier voor het eerst geïntroduceerd, beperkt tot wat deze pagina nodig heeft.

## 1. Nieuwe pagina — `apps/main/src/app/mijn-club/page.tsx`

Server component, zelfde stijl als `apps/main/src/app/account/page.tsx`:
- `getSessionUser()`; `redirect("/login")` als niet ingelogd; `redirect("/")` als niet (`user.isClubBeheerder && user.clubId`) — deze pagina bestaat alleen voor clubbeheerders, een platform-admin heeft geen eigen club en krijgt hier niets te zien.
- Data direct via `prisma` (geen `fetchMainApi`-omweg — dit ís main al):
  - Club: `prisma.club.findUnique({ where: { id: user.clubId } })`.
  - Leden: `prisma.user.findMany({ where: { clubId: user.clubId } })` + `lastLoginAt` via `prisma.session.groupBy` — zelfde berekening als de bestaande `GET /api/admin/users` (`apps/main/src/app/api/admin/users/route.ts:20-25`).
  - Lidverzoeken: `prisma.user.findMany({ where: { pendingClubId: user.clubId } })` — zelfde filter als `GET /api/admin/club-requests`.
- Rendert: kop met clubnaam + status-badge (Actief/Niet actief, read-only — activeren/deactiveren blijft admin-only), `ClubRequestsTable`, `MembersTable`.

Mutaties (rol wisselen, clubrol wisselen, verzoek goedkeuren/afwijzen) blijven de bestaande, al `requireClubManager`-scoped endpoints: `PATCH /api/admin/users/[id]`, `PATCH /api/admin/users/[id]/club-manager`, `PATCH /api/admin/club-requests/[id]`. Geen backend-wijziging — ze worden nu alleen same-origin aangeroepen in plaats van vanuit een andere app.

## 2. UI-laag in `apps/main`

Nieuwe dependencies (`apps/main/package.json`): `@radix-ui/react-select`, `class-variance-authority`, `clsx`, `tailwind-merge`.

Nieuw, 1-op-1 gekopieerd uit `apps/admin` (geen wijziging in stijl/logica, alleen andere locatie):
- `apps/main/src/lib/utils.ts` — `cn()`-helper.
- `apps/main/src/components/ui/badge.tsx`, `button.tsx`, `select.tsx`, `table.tsx`.

Geen `Dialog`/`Checkbox` nodig — die dienden alleen admin-only acties (activeren/deactiveren-confirm, delete-confirm, de oude Clubrol-checkbox die inmiddels al een Select is) die hier niet bestaan.

Nieuw, doelgericht (geen kopie van admin's componenten):
- `apps/main/src/app/mijn-club/members-table.tsx` — kolommen: Naam, E-mail, Rol (Select, rollen exclusief `admin`), Clubrol (Select: Clubbeheerder/Clublid), Status (Badge Actief/Gedeactiveerd). Geen Capabilities/Club/Aangemaakt/Laatste-inlog-kolommen — niet relevant voor de dagelijkse taak "wie zit erin, welke rol, wie is beheerder".
- `apps/main/src/app/mijn-club/club-requests-table.tsx` — Naam, E-mail, Goedkeuren/Afwijzen-knoppen, zelfde gedrag als admin's `ClubRequestsTable`.

## 3. Nav

`packages/ui/src/korfbal-tool-bar.tsx`: "Mijn club"-item linkt naar `/mijn-club` (was `` `/admin/clubs/${user.clubId}` ``) — geen dynamisch segment nodig, de pagina leidt de eigen club af uit de sessie.

## 4. Admin terugzetten naar pre-Mijn-club-staat

- `apps/admin/src/app/clubs/[id]/page.tsx`: `requireClubManager` → weer `requireAdmin`, geen scope-guard, geen `ClubRequestsTable`, `ClubEditForm` zonder `scope`-prop, `UsersTable` zonder `editableRoles`/`editableClubRol`.
- `apps/admin/src/components/club-edit-form.tsx`: `scope`-prop weg, naam/code-edit + activeren/deactiveren/verwijderen altijd zichtbaar (was al zo vóór de Mijn-club-feature).
- `apps/admin/src/components/users-table.tsx`: `editableRoles`/`editableClubRol` weg (enige caller verdwijnt) — terug naar de simpele read-only Rol/Clubrol-badges.
- `apps/main/src/app/api/admin/clubs/route.ts` GET: `requireClubManager` → weer `requireAdmin` (enige overgebleven consumers zijn admin-only: `/clubs`-lijst en `/clubs/[id]`).

**Blijft ongewijzigd** (nog steeds correct, nu bediend door de nieuwe main-pagina i.p.v. admin):
- `PATCH /api/admin/users/[id]` — privilege-fix die `role: "admin"` blokkeert voor `scope.type === "club"`.
- `PATCH /api/admin/users/[id]/club-manager` — `requireClubManager`-scope + laatste-beheerder-guard.

## Buiten scope

- Geen wijziging aan hoe platform-admins clubs beheren.
- Geen gedeelde UI-package (packages/ui) voor Table/Select/Badge/Button — bewuste keuze om admin's bestaande component-stijl simpelweg te dupliceren in main i.p.v. een grotere refactor die beide apps's imports zou raken.
