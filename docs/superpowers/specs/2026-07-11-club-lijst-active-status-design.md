# Club-lijst herstructureren + active-status — design

## Aanleiding

Vandaag: `apps/admin/clubs`-lijst toont alle clubs plat onder elkaar, met inline edit (naam/code) en Opslaan/Verwijderen direct in de rij. Er is geen "actief/inactief"-concept op Club — elke club is direct bruikbaar zodra aangemaakt.

Gewenst: lijstpagina wordt read-only overzicht (naam, ClubID, aantal gebruikers), gegroepeerd op relevantie. Bewerken (naam/code), leden bekijken, en activeren/deactiveren/verwijderen verhuizen naar een detailpagina per club. Nieuwe clubs starten inactief — moeten eerst geactiveerd worden voor gebruik.

## 1. Datamodel (`packages/db/prisma/schema.prisma`)

```prisma
model Club {
  ...
  active Boolean @default(true)
  ...
}

enum AuditAction {
  ...
  club_activated
  club_deactivated
}
```

`@default(true)` zorgt dat bestaande clubs bij migratie `true` krijgen (geen breaking change voor huidige clubs). Nieuwe clubs starten desondanks inactief: `POST /api/admin/clubs` zet expliciet `active: false` in de `create`-call, los van de kolom-default.

## 2. Types/schemas

- `packages/types/src/club.ts` — `Club` interface: veld `active: boolean` erbij.
- `apps/admin/src/components/clubs-table.tsx` — `AdminClub` interface: veld `active: boolean` erbij.
- `packages/types/src/schemas/admin.ts` — nieuw:
  ```ts
  export const updateClubStatusSchema = z.object({ active: z.boolean() });
  export type UpdateClubStatusInput = z.infer<typeof updateClubStatusSchema>;
  ```
  Zelfde vorm als bestaande `updateUserStatusSchema` (`{ deactivated: boolean }`).

## 3. API (`apps/main/src/app/api/admin/clubs/...`)

- `GET /api/admin/clubs` — select/response krijgt `active` erbij.
- `POST /api/admin/clubs` — `prisma.club.create` krijgt `active: false`; response-object ook `active: false`.
- `PATCH /api/admin/clubs/[id]` — ongewijzigd qua velden (`naam`, `code`); response-object krijgt `active` erbij (voor consistentie met GET).
- Nieuw `PATCH /api/admin/clubs/[id]/status` — zelfde patroon als `apps/main/src/app/api/admin/users/[id]/status/route.ts`:
  - `requireAdmin` (clubs-CRUD blijft admin-only, net als de andere club-routes — niet `requireClubManager`).
  - Body via `updateClubStatusSchema`.
  - `prisma.club.update({ data: { active: parsed.data.active } })`.
  - Audit log `club_activated` / `club_deactivated`, metadata `{ clubId: id }`.
  - Geen sessie-revocatie nodig (dat is user-specifiek, niet van toepassing op clubs).

## 4. Lijstpagina (`apps/admin/src/components/clubs-table.tsx`)

Rij toont alleen: naam, ClubID, gebruikersaantal (`Badge`). Geen inline edit-inputs, geen Opslaan/Verwijderen-knoppen meer in de rij.

Clubs worden client-side in 3 groepen verdeeld (volgorde van de `clubs`-prop, zoals nu al alfabetisch via de API, blijft binnen elke groep behouden):

1. **Met leden** (`userCount > 0`) — geen sectielabel, staat bovenaan. Hele rij klikbaar (`cursor-pointer`, `onClick` → `router.push(/clubs/${id})`), zelfde patroon als `UsersTable`.
2. **Actief, geen leden** (`userCount === 0 && active`) — klein grijs sectielabel "Actief". Rij ook klikbaar naar detailpagina.
3. **Niet actief** (`userCount === 0 && !active`) — klein grijs sectielabel "Niet actief". Rij grijs/gedimd (`opacity-50` of vergelijkbaar), niet klikbaar, geen `Link`/`onClick`. Actions-cell toont alleen een kleine knop "Activeren" die direct `PATCH /api/admin/clubs/[id]/status` met `{ active: true }` doet en `router.refresh()` — geen confirm-dialog nodig (activeren is niet destructief).

"Nieuwe club"-dialog (`CreateClubDialog`) blijft bovenin de pagina, ongewijzigd qua velden (naam, ClubID, beheerder e-mail optioneel). Nieuw aangemaakte club landt automatisch in groep 3 (inactief, 0 leden — tenzij een beheerder gekoppeld wordt, dan meteen groep 1).

## 5. Detailpagina (`apps/admin/src/app/clubs/[id]/`)

`page.tsx` blijft server component (fetch club + users via `fetchMainApi`), maar rendert nu een nieuw client component i.p.v. rechtstreeks alleen `UsersTable`.

Nieuw `apps/admin/src/components/club-edit-form.tsx` (client component, zelfde stijl/structuur als bestaande `user-edit-form.tsx`):

- Info-blok: ID, ClubID, aantal gebruikers, status (Actief/Niet actief — `Badge variant="success"/"neutral"`, zelfde conventie als user-status in `UsersTable`).
- Bewerk-form: naam + ClubID inputs, "Opslaan"-knop met dirty-check (zoals nu al in `ClubRow`), `PATCH /api/admin/clubs/[id]`.
- Status-knoppen:
  - Actief → "Deactiveren" (`variant="destructive"`, via confirm-dialog — zelfde asymmetrie als user activeren/deactiveren in `user-edit-form.tsx`).
  - Niet actief → "Activeren" (`variant="outline"`, direct, geen dialog).
  - Beide: `PATCH /api/admin/clubs/[id]/status`, audit-log server-side.
- "Verwijderen"-knop (`variant="destructive"`, confirm-dialog), disabled zolang `userCount > 0` — zelfde guard/copy als huidige delete-dialog in `ClubRow`.

Onder het formulier: bestaande `UsersTable` met leden van de club (ongewijzigd) — rijen zijn al klikbaar naar `/users/[id]` voor daadwerkelijk aanpassen van een lid. Dat dekt "leden bekijken en aanpassen"; geen nieuwe member-edit-UI nodig op de clubpagina zelf.

`page.tsx`'s huidige header (naam, ClubID, "Terug naar clubs"-link) blijft, ClubID-regel kan vervallen omdat die nu in het info-blok van `club-edit-form.tsx` staat — of blijft in de header, is implementatiedetail zonder functioneel verschil.

## 6. Buiten scope

- Geen bulk-activeren.
- Geen validatie die deactiveren blokkeert bij aanwezige leden (kan, is een edge case, niet gevraagd).
- `PRODUCT.md`/`DESIGN.md` niet aangepast — geen registeraanpassing gevraagd.
