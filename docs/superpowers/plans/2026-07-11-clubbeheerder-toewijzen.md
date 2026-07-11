# Clubbeheerder mag Clubbeheerder-status wisselen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a club-beheerder promote/demote another member of their own club to/from `isClubBeheerder`, inline from the "Mijn club" page, while guaranteeing a club never ends up with zero beheerders.

**Architecture:** Relax `PATCH /api/admin/users/[id]/club-manager` from `requireAdmin` to `requireClubManager` (scoped to own club), add a server-side last-beheerder guard that applies to every actor, then make the existing read-only "Clubrol" badge in `UsersTable` an inline `Checkbox` when a new `editableClubRol` prop is set, wired from `/clubs/[id]`.

**Tech Stack:** Next.js (App Router), Prisma/PostgreSQL, Radix UI (`@radix-ui/react-checkbox`), pnpm monorepo (turbo).

## Global Constraints

- The last-beheerder guard applies to every actor (admin included) — one rule, no per-role exception (see design spec section 1).
- `requireClubManager` scoping: a club-beheerder may only act on users in their own club (`target.clubId === scope.clubId`) — same pattern as every other `requireClubManager` route in this codebase.
- `/users/[id]`'s existing Clubbeheerder `Checkbox` (in `user-edit-form.tsx`, `scope === "all"`-only) is unchanged — out of scope.
- No new test framework — verify via `typecheck`/`lint`/`build` plus manual smoke checks, consistent with the rest of this repo.
- Dutch UI copy throughout.

---

### Task 1: Server — scope `club-manager` route + last-beheerder guard

**Files:**
- Modify: `apps/main/src/app/api/admin/users/[id]/club-manager/route.ts`

**Interfaces:**
- Consumes: `requireClubManager` (from `@/lib/require-user`, already used by sibling routes — returns `{ user, scope: { type: "all" } | { type: "club"; clubId: string } }` or `{ response }`).
- Produces: no new exports — `PATCH .../club-manager` now returns `200` for a scoped club-beheerder acting on their own club's members, `404 not_found` for a club-beheerder targeting someone outside their club, and `409 conflict` when the request would leave a club with zero beheerders.

- [ ] **Step 1: Replace the auth check and add the scope guard**

Replace the full contents of `apps/main/src/app/api/admin/users/[id]/club-manager/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserClubManagerSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// A club can have multiple beheerders; both a platform-admin and a
// club-beheerder (scoped to their own club) may appoint/revoke them — see
// design spec docs/superpowers/specs/2026-07-11-clubbeheerder-toewijzen-design.md.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserClubManagerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (result.scope.type === "club" && target.clubId !== result.scope.clubId)) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }
  if (!target.clubId) {
    return errorResponse("conflict", "Gebruiker heeft geen club — kan geen beheerder zijn");
  }

  if (!parsed.data.isClubBeheerder && target.isClubBeheerder) {
    const otherBeheerders = await prisma.user.count({
      where: { clubId: target.clubId, isClubBeheerder: true, NOT: { id } },
    });
    if (otherBeheerders === 0) {
      return errorResponse("conflict", "Kan niet intrekken: dit is de enige beheerder van de club");
    }
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { isClubBeheerder: parsed.data.isClubBeheerder },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "club_manager_changed",
        targetUserId: id,
        metadata: { clubId: target.clubId, isClubBeheerder: parsed.data.isClubBeheerder },
      },
    });
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm --filter @korfbaltools/main typecheck && pnpm --filter @korfbaltools/main lint`

Expected: both exit 0.

- [ ] **Step 3: Manual smoke check**

With the dev server running and a club-beheerder session cookie for a beheerder whose club has exactly one beheerder (themselves) and at least one other member `<memberId>`:

```bash
# Promote another member — should succeed
curl -s -X PATCH http://localhost:3000/api/admin/users/<memberId>/club-manager \
  -H "Content-Type: application/json" -H "Cookie: <club-beheerder session cookie>" \
  -d '{"isClubBeheerder": true}' | jq

# Demote self while being the only *other* beheerder now gone — should still succeed
# (there are now 2 beheerders, so demoting either one is fine)
curl -s -X PATCH http://localhost:3000/api/admin/users/<memberId>/club-manager \
  -H "Content-Type: application/json" -H "Cookie: <club-beheerder session cookie>" \
  -d '{"isClubBeheerder": false}' | jq

# Now demote the last remaining beheerder (yourself) — should be rejected
curl -s -X PATCH http://localhost:3000/api/admin/users/<own-user-id>/club-manager \
  -H "Content-Type: application/json" -H "Cookie: <club-beheerder session cookie>" \
  -d '{"isClubBeheerder": false}' | jq
```

Expected: first two calls return `200` with the updated user; the third returns `{"error":{"code":"conflict","message":"Kan niet intrekken: dit is de enige beheerder van de club"}}`.

- [ ] **Step 4: Commit**

```bash
git add "apps/main/src/app/api/admin/users/[id]/club-manager/route.ts"
git commit -m "feat(api): let club-beheerders toggle isClubBeheerder for their own club, with a last-beheerder guard"
```

---

### Task 2: `UsersTable` — inline, editable Clubrol column

**Files:**
- Modify: `apps/admin/src/components/users-table.tsx`

**Interfaces:**
- Consumes: `Checkbox` from `@/components/ui/checkbox` (already used in `user-edit-form.tsx` for the same field), `ApiErrorBody` from `@korfbaltools/types`.
- Produces: `UsersTableProps` gains `editableClubRol?: boolean`. When set (and `showBeheerderBadge` is also set — the Clubrol column only exists when that's true), the Clubrol cell renders an interactive `Checkbox` instead of a read-only `Badge`.

- [ ] **Step 1: Add the `ApiErrorBody` import and the `editableClubRol` prop**

In `apps/admin/src/components/users-table.tsx`, update the imports and `UsersTableProps`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { ApiErrorBody, Club, Role, User } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  clubs: Pick<Club, "id" | "naam">[];
  showBeheerderBadge?: boolean;
  editableRoles?: Role[];
  editableClubRol?: boolean;
}
```

- [ ] **Step 2: Pass the prop through `UsersTable` into `UserRow`**

Replace the `UsersTable` function's body (keep everything above `return (` — the empty-state check — unchanged) starting from the destructured props through the `UserRow` mapping:

```tsx
export function UsersTable({ users, clubs, showBeheerderBadge, editableRoles, editableClubRol }: UsersTableProps) {
```

and the row map:

```tsx
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            clubNaam={user.clubId ? (clubNameById.get(user.clubId) ?? "—") : "—"}
            showBeheerderBadge={showBeheerderBadge}
            editableRoles={editableRoles}
            editableClubRol={editableClubRol}
          />
        ))}
      </TableBody>
```

- [ ] **Step 3: Add `changeClubManager` and the editable Clubrol cell to `UserRow`**

Update `UserRow`'s signature and body:

```tsx
function UserRow({
  user,
  clubNaam,
  showBeheerderBadge,
  editableRoles,
  editableClubRol,
}: {
  user: User;
  clubNaam: string;
  showBeheerderBadge?: boolean;
  editableRoles?: Role[];
  editableClubRol?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeRole(role: Role) {
    setPending(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setPending(false);
    router.refresh();
  }

  async function changeClubManager(isClubBeheerder: boolean) {
    setPending(true);
    const response = await fetch(`/api/admin/users/${user.id}/club-manager`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isClubBeheerder }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      window.alert(body.error.message);
      return;
    }
    router.refresh();
  }
```

Then replace the Clubrol `TableCell` (the `{showBeheerderBadge && (...)}` block):

```tsx
      {showBeheerderBadge && (
        <TableCell onClick={(event) => event.stopPropagation()}>
          {editableClubRol ? (
            <label htmlFor={`club-beheerder-${user.id}`} className="flex items-center gap-2 text-sm">
              <Checkbox
                id={`club-beheerder-${user.id}`}
                checked={user.isClubBeheerder}
                disabled={pending}
                onCheckedChange={(checked) => changeClubManager(checked === true)}
              />
              {user.isClubBeheerder ? "Clubbeheerder" : "Clublid"}
            </label>
          ) : (
            <Badge variant={user.isClubBeheerder ? "default" : "neutral"}>
              {user.isClubBeheerder ? "Clubbeheerder" : "Clublid"}
            </Badge>
          )}
        </TableCell>
      )}
```

(The `onClick={(event) => event.stopPropagation()}` matches the same fix already applied to the Rol cell — without it, clicking the checkbox would also trigger the row's `onClick` navigation to `/users/${user.id}`.)

- [ ] **Step 4: Typecheck, lint, build**

Run: `pnpm --filter @korfbaltools/admin typecheck && pnpm --filter @korfbaltools/admin lint && pnpm --filter @korfbaltools/admin build`

Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/users-table.tsx
git commit -m "feat(admin): make the Clubrol column an inline Clubbeheerder toggle"
```

---

### Task 3: Wire `editableClubRol` into `/clubs/[id]`

**Files:**
- Modify: `apps/admin/src/app/clubs/[id]/page.tsx:58-63`

**Interfaces:**
- Consumes: `UsersTable`'s new `editableClubRol` prop (Task 2).
- Produces: no new exports.

- [ ] **Step 1: Pass `editableClubRol` to `UsersTable`**

In `apps/admin/src/app/clubs/[id]/page.tsx`, change:

```tsx
        <UsersTable
          clubs={clubsForNameLookup}
          users={clubUsers}
          showBeheerderBadge
          editableRoles={editableRoles}
        />
```

to:

```tsx
        <UsersTable
          clubs={clubsForNameLookup}
          users={clubUsers}
          showBeheerderBadge
          editableRoles={editableRoles}
          editableClubRol
        />
```

(Passed unconditionally for both scopes — admin gets the same inline convenience instead of only the `/users/[id]` checkbox, per design spec section 3.)

- [ ] **Step 2: Typecheck, lint, build**

Run: `pnpm --filter @korfbaltools/admin typecheck && pnpm --filter @korfbaltools/admin lint && pnpm --filter @korfbaltools/admin build`

Expected: all exit 0.

- [ ] **Step 3: Commit**

```bash
git add "apps/admin/src/app/clubs/[id]/page.tsx"
git commit -m "feat(admin): enable inline Clubbeheerder toggle on the club page"
```

---

### Task 4: Full monorepo verification

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck/lint/build**

Run: `pnpm typecheck && pnpm lint && pnpm build`

Expected: all exit 0.

- [ ] **Step 2: Manual browser walkthrough (requires a club-beheerder login)**

Log in as a club-beheerder, go to "Mijn club" (`/admin/clubs/<own-club-id>`), and verify:

1. Each member row's Clubrol column shows a checkbox instead of a static badge.
2. Checking it on a "Clublid" row promotes them to "Clubbeheerder" (persists after refresh); unchecking a "Clubbeheerder" row demotes them back — both without navigating away from the page.
3. Demoting the last remaining beheerder of the club (possibly yourself) shows an alert with "Kan niet intrekken: dit is de enige beheerder van de club" and the checkbox stays checked.
4. Logging in as a platform-admin on any club's page: the same inline checkbox works, with the same last-beheerder guard.
5. `/users/[id]`'s existing Clubbeheerder checkbox (visible only for a platform-admin) still works unchanged.

Expected: all five behaviors match; no console errors.

- [ ] **Step 3: Report results**

If any step fails, fix the relevant task's file before considering this plan done.
