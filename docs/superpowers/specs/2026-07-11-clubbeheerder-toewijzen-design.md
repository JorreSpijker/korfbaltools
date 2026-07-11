# Clubbeheerder mag Clubbeheerder-status wisselen — design

## Aanleiding

`isClubBeheerder`-toggle was bewust admin-only (`docs/superpowers/specs/2026-07-10-club-beheerder-design.md` sectie 4: "een club kan meerdere beheerders hebben, maar alleen een platform-admin wijst ze aan/af") en is als zodanig ook herbevestigd als "buiten scope" in `docs/superpowers/specs/2026-07-11-mijn-club-design.md`. Dat besluit wordt hier expliciet heropend: een clubbeheerder wil zelf een ander clublid ook beheerder kunnen maken (en weer terug kunnen zetten), scoped tot de eigen club — geen platform-brede rechten erbij.

## 1. Server — `PATCH /api/admin/users/[id]/club-manager`

`apps/main/src/app/api/admin/users/[id]/club-manager/route.ts`:
- `requireAdmin()` vervangen door `requireClubManager()`.
- Scope-check, zelfde patroon als de andere `requireClubManager`-routes: als `result.scope.type === "club" && target.clubId !== result.scope.clubId` → `errorResponse("not_found", "Gebruiker niet gevonden")`.
- Bestaande check "geen club → kan geen beheerder zijn" blijft staan.
- **Nieuwe guard, geldt voor elke actor (ook admin) — niet alleen voor clubbeheerder-scope:** wanneer `parsed.data.isClubBeheerder === false && target.isClubBeheerder === true`, tel de overige beheerders van `target.clubId` (`isClubBeheerder: true`, exclusief deze user). Is dat aantal `0` → `errorResponse("conflict", "Kan niet intrekken: dit is de enige beheerder van de club")`. Dit voorkomt dat een club zonder beheerder komt te staan, onafhankelijk van wie de actie uitvoert — één regel, geen uitzondering per rol.
- Audit log `club_manager_changed` (actor/target/metadata) blijft ongewijzigd.

## 2. Client — Clubrol-kolom wordt actionable

`apps/admin/src/components/users-table.tsx`:
- Nieuwe optionele prop `editableClubRol?: boolean` op `UsersTableProps`.
- Wanneer gezet: de Clubrol-cel (nu een read-only `Badge`, alleen zichtbaar bij `showBeheerderBadge`) rendert i.p.v. daarvan een `Checkbox` (met per-rij unieke id, bv. `` `club-beheerder-${user.id}` ``) + labeltekst "Clubbeheerder"/"Clublid", die bij wijziging direct `PATCH /api/admin/users/${user.id}/club-manager` aanroept met `{ isClubBeheerder }`.
- Bij een falende response (bv. de laatste-beheerder-guard): `window.alert(<foutmelding>)` — zelfde precedent als de bestaande `resetPassword`-flow in `user-edit-form.tsx` die ook al `window.alert` gebruikt voor terugkoppeling die niet in een inline error-string past. Bij succes: `router.refresh()`.
- `showBeheerderBadge` zonder `editableClubRol` blijft de bestaande read-only Badge tonen (geen regressie op andere call sites — er is er trouwens nog maar één: `/clubs/[id]`).

## 3. Wiring

`apps/admin/src/app/clubs/[id]/page.tsx`: `UsersTable` krijgt `editableClubRol` mee (voor beide scopes — admin krijgt zo ook het gemak van inline wisselen op deze pagina, i.p.v. alleen via de bestaande checkbox op `/users/[id]`).

## Buiten scope

- `/users/[id]`'s bestaande Clubbeheerder-`Checkbox` (in `user-edit-form.tsx`, nu `scope === "all"`-only) blijft ongewijzigd — geen dubbele UI, niet gevraagd.
- Geen wijziging aan wie een club-beheerder mag *verwijderen* (dat is de bestaande, ongewijzigde user-delete-flow, admin-only) — dit gaat alleen over de `isClubBeheerder`-vlag zelf.
