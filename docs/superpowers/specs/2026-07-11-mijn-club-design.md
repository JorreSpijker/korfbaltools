# "Mijn club" voor clubbeheerders — design

## Aanleiding

Clubbeheerder (`isClubBeheerder: true` + `clubId` op `User`) heeft vandaag geen enkele navigatie-ingang naar het adminpaneel: `AdminSettings` (`packages/ui/src/admin-settings.tsx:13`) toont de vaste "Adminpaneel"-knop alleen bij `role === "admin"`, en `KorfbalToolBar`'s dropdownmenu (`packages/ui/src/korfbal-tool-bar.tsx`) heeft alleen "Mijn gegevens"/"Uitloggen". De gateway in `apps/main/src/middleware.ts:92` laat clubbeheerders al door naar `/admin/*` — enige blokkade is UI (geen link) en `apps/admin/src/app/clubs/[id]/page.tsx` dat lokaal `requireAdmin()` afdwingt in plaats van `requireClubManager()`.

Gewenst: clubbeheerder krijgt een "Mijn club"-item in het dropdownmenu, dat naar de eigen club-detailpagina linkt waar hij leden kan bekijken, hun rol kan wisselen, en lidverzoeken kan afhandelen.

Bijvangst tijdens ontwerp: `PATCH /api/admin/users/[id]` (rol wijzigen) draait al op `requireClubManager`, en de Rol-`<Select>` in `user-edit-form.tsx` toont ongefilterd alle rollen inclusief `admin` — een clubbeheerder kan dus vandaag al (zodra de pagina bereikbaar is) zichzelf of een lid tot platform-admin promoveren. Wordt in deze feature gedicht, omdat "Mijn club" die pagina voor het eerst normaal bereikbaar maakt.

## 1. Toegang — `/clubs/[id]` hergebruiken voor clubbeheerder-scope

`apps/admin/src/app/clubs/[id]/page.tsx`:
- `requireAdmin()` (uit `@/lib/require-admin`) vervangen door `requireClubManager()`, die `{ user, scope }` teruggeeft (`ClubManagerScope = { type: "all" } | { type: "club"; clubId: string }`).
- Guard: als `scope.type === "club" && scope.clubId !== id` → `notFound()`. Een clubbeheerder kan zo alleen zijn eigen club-pagina zien, admin kan elke club zien (ongewijzigd).
- Pagina haalt naast clubs/users ook `/api/admin/club-requests` op (zelfde call als de bestaande `apps/admin/src/app/page.tsx:17`), filtert client-side `requests.filter((r) => r.pendingClubId === id)`, en rendert dat via de bestaande `ClubRequestsTable` (`apps/admin/src/components/club-requests-table.tsx`) boven de ledentabel. Voor een clubbeheerder is dit al vanzelf alleen eigen-club-requests (API scoped server-side), de client-filter is voor de admin-case (die anders alle clubs' requests zou zien op deze ene club-pagina).
- `ClubEditForm` (`apps/admin/src/components/club-edit-form.tsx`) krijgt een `scope: "all" | "club"` prop (zelfde patroon als `UserEditForm`). Bij `scope === "club"`: naam/code-inputs + Opslaan-knop, Activeren/Deactiveren-knoppen, en Verwijderen-knop worden niet gerenderd — alleen het read-only infoblok (ID, gebruikersaantal, status-badge) blijft staan.

## 2. Rol wisselen inline in de ledentabel

`apps/admin/src/components/users-table.tsx`:
- Nieuwe optionele prop `editableRoles?: Role[]` op `UsersTableProps`.
- Indien gezet: de Rol-kolom (nu een `Badge`, regel 66-68) rendert i.p.v. daarvan een `<Select>` (zelfde UI-component als in `user-edit-form.tsx`) met alleen de rollen uit `editableRoles`, `defaultValue={user.role}`, die bij wijziging direct `PATCH /api/admin/users/${user.id}` aanroept (bestaande route, al `requireClubManager`-scoped) en daarna `router.refresh()`.
- Alleen gebruikt op `/clubs/[id]`. De globale ledenoverzicht-pagina (`apps/admin/src/app/page.tsx`) geeft deze prop niet door — blijft de bestaande read-only badge.
- Op `/clubs/[id]`: `editableRoles={scope === "all" ? ROLES : ROLES.filter((r) => r !== "admin")}` (zie punt 3 voor de `!== "admin"`-filter).

## 3. Privilege-escalatie dichten

- **Server (de echte fix):** `apps/main/src/app/api/admin/users/[id]/route.ts` PATCH-handler — na `updateUserRoleSchema.safeParse`, vóór de transactie: als `result.scope.type === "club" && parsed.data.role === "admin"` → `errorResponse("forbidden", "Clubbeheerders kunnen geen platform-admin toewijzen")`.
- **Client (UX, geen enforcement):** `apps/admin/src/components/user-edit-form.tsx` — de bestaande Rol-`<Select>` (regel ~181-192) toont bij `scope === "club"` alleen `ROLES.filter((r) => r !== "admin")` i.p.v. alle `ROLES`. Zelfde filter als de nieuwe inline select uit punt 2.

## 4. Nav-ingang — "Mijn club" in het dropdownmenu

`packages/ui/src/korfbal-tool-bar.tsx`:
- `KorfbalToolBarProps.user` type wordt `Pick<User, "email" | "naam" | "role" | "isClubBeheerder" | "clubId"> | null` (was zonder de laatste twee, regel 17).
- Nieuw dropdown-item "Mijn club" toegevoegd in zowel het desktop-dropdown-blok (na "Mijn gegevens", rond regel 106-121) als het mobiele blok (rond regel 182-197), zichtbaar wanneer `user?.isClubBeheerder && user?.clubId`. `onSelect` navigeert naar `` `/admin/clubs/${user.clubId}` `` (zelfde `/admin`-basePath-conventie als `AdminSettings`'s `adminHref` default).
- Geen wijziging nodig in `apps/main/src/app/layout.tsx:32` of `apps/admin/src/app/layout.tsx:17` — beide geven al de volledige `User`/publieke user door (via `getSessionUser()` resp. `getCurrentUser()`), die al `isClubBeheerder`/`clubId` bevatten. Alleen de te-smalle `Pick`-type in `KorfbalToolBarProps` blokkeerde dit.
- Platform-admins zien "Mijn club" niet (geen eigen `clubId`) — bereiken clubs zoals nu via de `/clubs`-lijst in `apps/admin`, ongewijzigd.

## Buiten scope

- Geen wijziging aan wie beheerder mag worden/afzetten (`isClubBeheerder`-toggle blijft admin-only, zoals vastgelegd in `docs/superpowers/specs/2026-07-10-club-beheerder-design.md` sectie 4 — dat is een bewuste eerdere designkeuze, hier niet heropend).
- Geen paginatie/filter op de ledentabel of club-requests-tabel — bestaand gedrag, ongewijzigd.
- Geen wijziging aan hoe admins zelf door het adminpaneel navigeren.
