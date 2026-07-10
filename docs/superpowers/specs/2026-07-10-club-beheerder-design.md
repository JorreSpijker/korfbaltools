# Club-beheer & club-beheerder — design

## Aanleiding

Vandaag: club-CRUD bestaat al in Admin (naam aanmaken/hernoemen/verwijderen). Users kiezen zelf hun club via `/account` (`PATCH /api/me`), effect is direct — geen goedkeuring. Er is precies één platform-brede `admin`-rol (zie `docs/plan.md` sectie 4/12: club-scoped admin stond al genoemd als toekomstige uitbreiding).

Gewenst: clubs krijgen een handmatige ClubID naast de naam; club-aanmaak kan meteen een beheerder koppelen; user-club-koppeling verloopt via een goedkeuring-flow i.p.v. direct; clubs kunnen een of meer beheerders hebben die (scoped tot hun eigen club) users beheren en join-verzoeken afhandelen in het Admin-panel.

## 1. Datamodel (`packages/db/prisma/schema.prisma`)

```prisma
model Club {
  ...
  naam String
  code String @unique   // "ClubID" — handmatig ingevoerde, unieke code
  ...
}

model User {
  ...
  clubId          String?
  pendingClubId   String?              // aangevraagde club, nog niet goedgekeurd
  isClubBeheerder Boolean @default(false)
  ...
}

enum AuditAction {
  ...
  club_join_requested
  club_join_approved
  club_join_rejected
  club_manager_changed
}
```

Geen aparte membership-request-tabel: `pendingClubId` (max één openstaand verzoek per user) + bestaande `AuditLog` volstaat, consistent met hoe `club_created`/`club_updated` nu al gelogd worden. `isClubBeheerder` is een boolean op `User`, geen apart Role-enum-lid — user heeft toch maar één `clubId`, dus de vlag is vanzelf scoped tot die club. Meerdere beheerders per club: meerdere users met de vlag aan.

## 2. Club aanmaken (Admin)

`apps/admin/src/components/clubs-table.tsx` — `CreateClubDialog`:
- Nieuw verplicht veld **ClubID** (`code`), uniek (zelfde conflict-check als `naam` nu).
- Nieuw optioneel veld **Beheerder e-mail**. Moet een bestaande, geregistreerde user zijn.
  - Bestaat niet: foutmelding "Gebruiker bestaat nog niet, moet eerst zelf registreren."
  - Bestaat al bij een andere club: user wordt overgezet (`clubId` wijzigt naar nieuwe club).
  - Bij match: `clubId` + `isClubBeheerder = true` gezet, audit `club_manager_changed`.
- Geen invite-mail, geen user-aanmaak — user moet al bestaan (zelfde beperking als de huidige self-registratie-only flow, sectie 6 hieronder).

`ClubRow` (bewerken): naam + ClubID beide inline editable, zelfde patroon als nu (opslaan/verwijderen ongewijzigd).

`POST /api/admin/clubs` (`apps/main/src/app/api/admin/clubs/route.ts`): body wordt `{ naam, code, beheerderEmail? }`. Transactie: club aanmaken; indien `beheerderEmail` opgegeven: user opzoeken op email, `clubId` + `isClubBeheerder` zetten, audit `club_manager_changed`.

## 3. Join-request flow (main app, self-service club-keuze)

`apps/main/src/app/account/account-form.tsx` + `PATCH /api/me`:
- Club kiezen zet niet meer direct `clubId` — zet `pendingClubId`, audit `club_join_requested` (`actorId` = de user zelf, geen `targetUserId`, metadata `{ clubId }`).
- Geldt ook als user al een `clubId` heeft en een andere club kiest: huidige `clubId` blijft actief tot goedkeuring, geen "tussentijds clubloos".
- Geen club geselecteerd (leeg gemaakt): direct `clubId = null`, geen goedkeuring nodig — loskoppelen blijft vrij.
- UI: zolang `pendingClubId` gezet is, toont account-pagina "Aanvraag voor [clubnaam] in behandeling" + **Annuleren**-knop (zet `pendingClubId` terug naar `null`, geen audit-entry voor cancel). Dropdown tijdens pending disabled — geen tweede aanvraag erbovenop.

## 4. Beheerder-rol & scoped Admin-toegang

`apps/main/src/lib/require-user.ts`:
- Nieuwe helper `requireClubManager()`: laat door bij `role === "admin"` (scope `"all"`) OF `isClubBeheerder === true` (scope `"club"`, eigen `clubId`). Retourneert `{ scope: "all" } | { scope: "club", clubId: string }`.
- Gateway naar `/admin` (main-app middleware/rewrite) laat voortaan ook beheerders door, niet alleen `role === "admin"`.

`apps/admin`:
- Nav: beheerder (scope `"club"`) ziet alleen **Users**. Clubs, App-instellingen, Audit-log blijven `role === "admin"`-only, verborgen voor beheerder.
- Users-pagina: scope `"club"` filtert de lijst op eigen `clubId`, geen andere clubs zichtbaar.
- Nieuwe sectie/tab bovenaan Users-pagina: **Aanmeldingen** — toont users met `pendingClubId` gezet (scope `"club"`: alleen eigen club; scope `"all"`: alle clubs). Knoppen:
  - **Goedkeuren** → `clubId = pendingClubId`, `pendingClubId = null`, audit `club_join_approved` (`targetUserId` = aangevraagde user, metadata `{ clubId }`).
  - **Afwijzen** → `pendingClubId = null`, audit `club_join_rejected` (zelfde metadata).
- `user-edit-form.tsx`: binnen scope `"club"` mag beheerder rol/capabilities wijzigen en deactiveren voor eigen club-users — **niet** wachtwoord-reset, **niet** hard-delete (blijven platform-admin-only). Geen club-dropdown (zit al vast aan eigen club), geen delete-knop.

## 5. Audit logging

| Actie | actorId | targetUserId | metadata |
|---|---|---|---|
| `club_join_requested` | de user zelf | — | `{ clubId }` |
| `club_join_approved` | admin/beheerder | aangevraagde user | `{ clubId }` |
| `club_join_rejected` | admin/beheerder | aangevraagde user | `{ clubId }` |
| `club_manager_changed` | admin | betrokken user | `{ userId, clubId, isClubBeheerder }` |

## 6. Buiten scope

- Geen e-mail-invite voor nieuwe (nog niet geregistreerde) users — beheerder-veld bij club-aanmaak vereist een bestaand account.
- Geen geschiedenis van eerder afgewezen aanvragen — alleen wat in `AuditLog` staat, geen aparte request-tabel.
- Geen multi-club membership — user blijft gekoppeld aan precies één club (`clubId`).
- Audit-log-pagina blijft platform-admin-only, niet gefilterd/toegankelijk voor beheerder.
- Geen wachtwoord-reset of hard-delete-rechten voor beheerder.
