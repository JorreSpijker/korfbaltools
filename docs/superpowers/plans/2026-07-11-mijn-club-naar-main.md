# "Mijn club" verhuist naar apps/main Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the club-beheerder-facing "Mijn club" experience out of `apps/admin` into a new `/mijn-club` page in `apps/main`, and revert `apps/admin`'s `/clubs/[id]` back to its admin-only, pre-"Mijn club" state.

**Architecture:** New server-rendered page in `apps/main` reads the club/members/pending-requests directly via Prisma (no cross-app `fetchMainApi` hop needed — it's already inside `apps/main`); mutations reuse the existing, already-`requireClubManager`-scoped API routes (`PATCH /api/admin/users/[id]`, `PATCH /api/admin/users/[id]/club-manager`, `PATCH /api/admin/club-requests/[id]`) same-origin. A small Radix/shadcn-style UI layer (`Badge`, `Button`, `Select`, `Table`) is ported verbatim from `apps/admin` into `apps/main` since `apps/main` had none. `apps/admin`'s `/clubs/[id]` and `GET /api/admin/clubs` are reverted to their exact pre-"Mijn club" committed state (`requireAdmin`-only, no scope logic).

**Tech Stack:** Next.js (App Router), Prisma/PostgreSQL, Radix UI (`@radix-ui/react-select`), `class-variance-authority`, `clsx`, `tailwind-merge`, pnpm monorepo (turbo).

## Global Constraints

- `/mijn-club` is club-beheerder-only — a platform-admin has no personal club and gets redirected to `/` (see design spec section 1).
- Never pass a raw Prisma `User` (has `passwordHash`) into a client component — always map through `toPublicUser` first, same as every existing `apps/main` API route.
- Platform-admin club management (naam/code edit, activate/deactivate, delete) stays exclusively in `apps/admin` — not reachable from `/mijn-club`.
- No new test framework — verify via `typecheck`/`lint`/`build` plus manual smoke checks, consistent with the rest of this repo.
- Dutch UI copy throughout.

---

### Task 1: Port the UI primitives into `apps/main`

**Files:**
- Modify: `apps/main/package.json`
- Create: `apps/main/src/lib/utils.ts`
- Create: `apps/main/src/components/ui/badge.tsx`
- Create: `apps/main/src/components/ui/button.tsx`
- Create: `apps/main/src/components/ui/select.tsx`
- Create: `apps/main/src/components/ui/table.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `cn()` from `@/lib/utils`; `Badge`, `Button`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` from `@/components/ui/*` — exact same names/props as their `apps/admin` counterparts, consumed by Task 2.

- [ ] **Step 1: Add the new dependencies**

In `apps/main/package.json`, add to `"dependencies"` (matching the exact versions already used in `apps/admin/package.json`):

```json
    "@radix-ui/react-select": "^2.3.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
```

Run: `pnpm install`

Expected: lockfile updates, exits 0.

- [ ] **Step 2: Create the `cn` helper**

Create `apps/main/src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Port `Badge`**

Create `apps/main/src/components/ui/badge.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary-100 text-primary-700",
      neutral: "bg-neutral-100 text-neutral-700",
      success: "bg-success/10 text-success",
      danger: "bg-danger/10 text-danger",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

- [ ] **Step 4: Port `Button`**

Create `apps/main/src/components/ui/button.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        outline: "border border-neutral-300 bg-white hover:bg-neutral-100",
        destructive: "bg-danger text-white hover:bg-danger/90",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
```

- [ ] **Step 5: Port `Select`**

Create `apps/main/src/components/ui/select.tsx`:

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "z-50 min-w-32 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg",
        position === "popper" && "data-[side=bottom]:translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn("p-1", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]")}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-neutral-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
```

- [ ] **Step 6: Port `Table`**

Create `apps/main/src/components/ui/table.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-neutral-200">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-neutral-100", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-neutral-100", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("bg-white hover:bg-neutral-100", className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("h-10 px-4 text-left align-middle font-medium text-neutral-500", className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}
```

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm --filter @korfbaltools/main typecheck && pnpm --filter @korfbaltools/main lint`

Expected: both exit 0 (these new files aren't imported by anything yet, so this just confirms they compile standalone).

- [ ] **Step 8: Commit**

```bash
git add apps/main/package.json pnpm-lock.yaml apps/main/src/lib/utils.ts apps/main/src/components/ui
git commit -m "feat(main): port Badge/Button/Select/Table UI primitives from admin"
```

---

### Task 2: Build the `/mijn-club` page

**Files:**
- Create: `apps/main/src/app/mijn-club/page.tsx`
- Create: `apps/main/src/app/mijn-club/members-table.tsx`
- Create: `apps/main/src/app/mijn-club/club-requests-table.tsx`

**Interfaces:**
- Consumes: `Badge`/`Button`/`Select*`/`Table*` from Task 1; `getSessionUser` from `@/lib/session`; `toPublicUser` from `@/lib/user-mapper`; `prisma` from `@korfbaltools/db`; `User`/`Role`/`ApiErrorBody` from `@korfbaltools/types`.
- Produces: route `/mijn-club`, no exports consumed by later tasks except the route path itself (Task 3 links to it).

- [ ] **Step 1: Write `club-requests-table.tsx`**

Create `apps/main/src/app/mijn-club/club-requests-table.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";
import type { ApiErrorBody } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ClubJoinRequest {
  id: string;
  email: string;
  naam: string | null;
}

interface ClubRequestsTableProps {
  requests: ClubJoinRequest[];
}

export function ClubRequestsTable({ requests }: ClubRequestsTableProps) {
  if (requests.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <UserCheck className="h-4 w-4" />
        Aanmeldingen
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <ClubRequestRow key={request.id} request={request} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ClubRequestRow({ request }: { request: ClubJoinRequest }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review(approve: boolean) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/club-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <TableRow>
      <TableCell className="max-w-48 truncate font-medium text-neutral-900">{request.naam ?? "—"}</TableCell>
      <TableCell className="max-w-56 truncate">{request.email}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button size="sm" variant="outline" disabled={pending} onClick={() => review(false)}>
            Afwijzen
          </Button>
          <Button size="sm" disabled={pending} onClick={() => review(true)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Goedkeuren
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
```

(No club-name column, unlike admin's version — every request on this page is, by construction, for this club.)

- [ ] **Step 2: Write `members-table.tsx`**

Create `apps/main/src/app/mijn-club/members-table.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, Role, User } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EDITABLE_ROLES: Role[] = ["coach", "player", "referee"];

interface MembersTableProps {
  members: User[];
}

export function MembersTable({ members }: MembersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naam</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Clubrol</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <MemberRow key={member.id} member={member} />
        ))}
      </TableBody>
    </Table>
  );
}

function MemberRow({ member }: { member: User }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeRole(role: Role) {
    setPending(true);
    await fetch(`/api/admin/users/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setPending(false);
    router.refresh();
  }

  async function changeClubManager(isClubBeheerder: boolean) {
    setPending(true);
    const response = await fetch(`/api/admin/users/${member.id}/club-manager`, {
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

  return (
    <TableRow>
      <TableCell className="max-w-48 truncate font-medium text-neutral-900">{member.naam ?? "—"}</TableCell>
      <TableCell className="max-w-56 truncate" title={member.email}>
        {member.email}
      </TableCell>
      <TableCell>
        <Select defaultValue={member.role} disabled={pending} onValueChange={(value) => changeRole(value as Role)}>
          <SelectTrigger className="h-8 w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select
          defaultValue={member.isClubBeheerder ? "beheerder" : "lid"}
          disabled={pending}
          onValueChange={(value) => changeClubManager(value === "beheerder")}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beheerder">Clubbeheerder</SelectItem>
            <SelectItem value="lid">Clublid</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant={member.deactivatedAt ? "danger" : "success"}>
          {member.deactivatedAt ? "Gedeactiveerd" : "Actief"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
```

(`EDITABLE_ROLES` excludes `"admin"` — a club-beheerder must never be able to assign it, per the existing server-side guard in `PATCH /api/admin/users/[id]`.)

- [ ] **Step 3: Write `page.tsx`**

Create `apps/main/src/app/mijn-club/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { prisma } from "@korfbaltools/db";
import { getSessionUser } from "@/lib/session";
import { toPublicUser } from "@/lib/user-mapper";
import { Badge } from "@/components/ui/badge";
import { MembersTable } from "./members-table";
import { ClubRequestsTable, type ClubJoinRequest } from "./club-requests-table";

export default async function MijnClubPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.isClubBeheerder || !user.clubId) redirect("/");

  const club = await prisma.club.findUnique({ where: { id: user.clubId } });
  if (!club) redirect("/");

  const memberRecords = await prisma.user.findMany({
    where: { clubId: user.clubId },
    orderBy: { createdAt: "desc" },
  });
  const members = memberRecords.map(toPublicUser);

  const requests: ClubJoinRequest[] = await prisma.user.findMany({
    where: { pendingClubId: user.clubId },
    select: { id: true, email: true, naam: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{club.naam}</h1>
        <div>
          <Badge variant={club.active ? "success" : "neutral"}>{club.active ? "Actief" : "Niet actief"}</Badge>
        </div>
      </div>
      <ClubRequestsTable requests={requests} />
      <MembersTable members={members} />
    </main>
  );
}
```

(`memberRecords.map(toPublicUser)` is required, not optional — a raw Prisma `User` carries `passwordHash`, which must never reach a client component's serialized props.)

- [ ] **Step 4: Typecheck, lint, build**

Run: `pnpm --filter @korfbaltools/main typecheck && pnpm --filter @korfbaltools/main lint && pnpm --filter @korfbaltools/main build`

Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/mijn-club
git commit -m "feat(main): add /mijn-club page for club-beheerders"
```

---

### Task 3: Point the nav item at `/mijn-club`

**Files:**
- Modify: `packages/ui/src/korfbal-tool-bar.tsx` (two occurrences — desktop and mobile dropdown)

**Interfaces:**
- Consumes: nothing new.
- Produces: no new exports — pure copy change.

- [ ] **Step 1: Update both `onSelect` handlers**

In `packages/ui/src/korfbal-tool-bar.tsx`, both occurrences of:

```tsx
                        onSelect={() => {
                          window.location.href = `/admin/clubs/${user.clubId}`;
                        }}
```

change to:

```tsx
                        onSelect={() => {
                          window.location.href = "/mijn-club";
                        }}
```

(There are two — one in the desktop dropdown block, one in the mobile dropdown block. Both "Mijn club" `DropdownMenu.Item`s get this change. `user.clubId` is no longer referenced in the `href` since the page derives it from the session server-side — but the surrounding `{user.isClubBeheerder && user.clubId && (...)}` visibility check stays as-is, unchanged.)

- [ ] **Step 2: Typecheck and lint**

Run: `pnpm --filter @korfbaltools/ui typecheck && pnpm --filter @korfbaltools/ui lint`

Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/korfbal-tool-bar.tsx
git commit -m "feat(ui): point \"Mijn club\" nav item at /mijn-club instead of the admin app"
```

---

### Task 4: Revert `apps/admin` to its pre-"Mijn club" state

**Files:**
- Modify: `apps/admin/src/app/clubs/[id]/page.tsx`
- Modify: `apps/admin/src/components/club-edit-form.tsx`
- Modify: `apps/admin/src/components/users-table.tsx`
- Modify: `apps/main/src/app/api/admin/clubs/route.ts:1-30` (GET handler only)

**Interfaces:**
- Consumes: nothing new.
- Produces: `/clubs/[id]` in `apps/admin` is admin-only again (`requireAdmin`); `ClubEditForm` loses its `scope` prop (always shows full edit/status/delete controls); `UsersTable` loses `editableRoles`/`editableClubRol` (Rol column hidden and Clubrol shown as a read-only badge when `showBeheerderBadge` is set, matching the state before the "Mijn club" work started); `GET /api/admin/clubs` is `requireAdmin`-only again.

- [ ] **Step 1: Revert `club-edit-form.tsx`**

Replace the full contents of `apps/admin/src/components/club-edit-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ApiErrorBody } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { AdminClub } from "@/components/clubs-table";

const INPUT_CLASS =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

interface ClubEditFormProps {
  club: AdminClub;
}

export function ClubEditForm({ club }: ClubEditFormProps) {
  const router = useRouter();
  const [naam, setNaam] = useState(club.naam);
  const [code, setCode] = useState(club.code ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dirty = naam.trim() !== "" && code.trim() !== "" && (naam !== club.naam || code !== (club.code ?? ""));

  async function save() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/clubs/${club.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, code }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  async function changeStatus(active: boolean) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/clubs/${club.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    setDeactivateOpen(false);
    router.refresh();
  }

  async function remove() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/clubs/${club.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      setDeleteOpen(false);
      return;
    }
    router.push("/clubs");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-neutral-200 p-6">
      <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-md bg-neutral-50 p-4 text-sm">
        <div>
          <div className="text-xs text-neutral-500">ID</div>
          <div className="font-mono text-xs">{club.id}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Gebruikers</div>
          <Badge variant="neutral">{club.userCount}</Badge>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Status</div>
          <Badge variant={club.active ? "success" : "neutral"}>{club.active ? "Actief" : "Niet actief"}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="club-naam">Naam</Label>
          <input
            id="club-naam"
            value={naam}
            onChange={(event) => setNaam(event.target.value)}
            disabled={pending}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="club-code">ClubID</Label>
          <input
            id="club-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={pending}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <Button disabled={!dirty || pending} onClick={save}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Opslaan
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-t border-neutral-200 pt-4">
        {club.active ? (
          <Button disabled={pending} variant="destructive" onClick={() => setDeactivateOpen(true)}>
            Deactiveren
          </Button>
        ) : (
          <Button disabled={pending} variant="outline" onClick={() => changeStatus(true)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activeren
          </Button>
        )}
        <Button disabled={pending || club.userCount > 0} variant="destructive" onClick={() => setDeleteOpen(true)}>
          Verwijderen
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Club deactiveren</DialogTitle>
            <DialogDescription>
              {club.naam} kan hierna niet meer gebruikt worden totdat deze weer geactiveerd wordt.
            </DialogDescription>
          </DialogHeader>
          <Button disabled={pending} variant="destructive" onClick={() => changeStatus(false)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ja, deactiveren
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Club verwijderen</DialogTitle>
            <DialogDescription>
              {club.userCount > 0
                ? `${club.naam} heeft nog ${club.userCount} gekoppelde gebruiker(s) en kan niet verwijderd worden totdat deze losgekoppeld zijn.`
                : `${club.naam} wordt definitief verwijderd. Dit kan niet ongedaan gemaakt worden.`}
            </DialogDescription>
          </DialogHeader>
          <Button disabled={pending || club.userCount > 0} variant="destructive" onClick={remove}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ja, definitief verwijderen
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

- [ ] **Step 2: Revert `clubs/[id]/page.tsx`**

Replace the full contents of `apps/admin/src/app/clubs/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Club, User } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { UsersTable } from "@/components/users-table";
import { ClubEditForm } from "@/components/club-edit-form";
import type { AdminClub } from "@/components/clubs-table";
import { Container } from "@korfbaltools/ui";

interface ClubPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [clubsResponse, usersResponse] = await Promise.all([
    fetchMainApi("/api/admin/clubs"),
    fetchMainApi("/api/admin/users"),
  ]);
  await ensureOk(clubsResponse, "Kan clubs niet laden");
  await ensureOk(usersResponse, "Kan gebruikers niet laden");

  const { clubs } = (await clubsResponse.json()) as { clubs: AdminClub[] };
  const { users } = (await usersResponse.json()) as { users: User[] };

  const club = clubs.find((c) => c.id === id);
  if (!club) {
    notFound();
  }

  const clubUsers = users.filter((user) => user.clubId === id);
  const clubsForNameLookup: Pick<Club, "id" | "naam">[] = [{ id: club.id, naam: club.naam }];

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{club.naam}</h1>
          <Link className="text-sm text-primary-600 underline" href="/clubs">
            Terug naar clubs
          </Link>
        </div>
        <ClubEditForm club={club} />
        <UsersTable clubs={clubsForNameLookup} users={clubUsers} showBeheerderBadge />
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: Revert `users-table.tsx`**

Replace the full contents of `apps/admin/src/components/users-table.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { Club, User } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  clubs: Pick<Club, "id" | "naam">[];
  showBeheerderBadge?: boolean;
}

export function UsersTable({ users, clubs, showBeheerderBadge }: UsersTableProps) {
  const router = useRouter();
  const clubNameById = new Map(clubs.map((club) => [club.id, club.naam]));

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 py-16 text-center">
        <Users className="h-8 w-8 text-neutral-400" />
        <p className="font-medium text-neutral-900">Nog geen gebruikers</p>
        <p className="max-w-sm text-sm text-neutral-600">
          Zodra iemand een account aanmaakt op korfbaltools.nl, verschijnt die hier.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naam</TableHead>
          <TableHead>E-mail</TableHead>
          {!showBeheerderBadge && <TableHead>Rol</TableHead>}
          <TableHead>Capabilities</TableHead>
          <TableHead>Club</TableHead>
          {showBeheerderBadge && <TableHead>Clubrol</TableHead>}
          <TableHead>Aangemaakt</TableHead>
          <TableHead>Laatste inlog</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer"
            onClick={() => router.push(`/users/${user.id}`)}
          >
            <TableCell className="max-w-48 truncate font-medium text-neutral-900">
              <Link
                href={`/users/${user.id}`}
                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                title={user.naam ?? undefined}
              >
                {user.naam ?? "—"}
              </Link>
            </TableCell>
            <TableCell className="max-w-56 truncate" title={user.email}>
              {user.email}
            </TableCell>
            {!showBeheerderBadge && (
              <TableCell>
                <Badge variant={user.role === "admin" ? "default" : "neutral"}>{user.role}</Badge>
              </TableCell>
            )}
            <TableCell>
              {user.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.capabilities.map((capability) => (
                    <Badge key={capability} variant="neutral">
                      {capability}
                    </Badge>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="max-w-36 truncate">
              {user.clubId ? (clubNameById.get(user.clubId) ?? "—") : "—"}
            </TableCell>
            {showBeheerderBadge && (
              <TableCell>
                <Badge variant={user.isClubBeheerder ? "default" : "neutral"}>
                  {user.isClubBeheerder ? "Clubbeheerder" : "Clublid"}
                </Badge>
              </TableCell>
            )}
            <TableCell className="whitespace-nowrap text-neutral-600">
              {new Date(user.createdAt).toLocaleString("nl-NL")}
            </TableCell>
            <TableCell className="whitespace-nowrap text-neutral-600">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("nl-NL") : "—"}
            </TableCell>
            <TableCell>
              <Badge variant={user.deactivatedAt ? "danger" : "success"}>
                {user.deactivatedAt ? "Gedeactiveerd" : "Actief"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 4: Revert `GET /api/admin/clubs`**

`apps/main/src/app/api/admin/clubs/route.ts` currently starts with these top-level imports (unchanged by this step — `NextRequest`/`NextResponse`/`prisma`/`createClubSchema`/`errorResponse`/`validationErrorResponse` are all still used by `POST`, which is untouched):

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createClubSchema } from "@korfbaltools/types";
import { requireAdmin, requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";
```

Change only the fourth import line, from:

```ts
import { requireAdmin, requireClubManager } from "@/lib/require-user";
```

to:

```ts
import { requireAdmin } from "@/lib/require-user";
```

(`requireClubManager` becomes unused once the `GET` handler below no longer calls it — removing it from the import avoids an unused-import lint error.)

Then replace the `GET` function itself — everything from `export async function GET()` up to (but not including) `export async function POST` — with:

```ts
// Admin-only list, unlike the public /api/clubs — includes userCount so the
// admin UI can warn before a delete that would otherwise hit the FK
// constraint on User.clubId.
export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const clubs = await prisma.club.findMany({
    select: { id: true, naam: true, code: true, active: true, _count: { select: { users: true } } },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({
    clubs: clubs.map((club) => ({
      id: club.id,
      naam: club.naam,
      code: club.code,
      active: club.active,
      userCount: club._count.users,
    })),
  });
}
```

`POST` below stays byte-for-byte identical — this step only touches the import line and the `GET` function.

- [ ] **Step 5: Typecheck, lint, build**

Run: `pnpm --filter @korfbaltools/admin typecheck && pnpm --filter @korfbaltools/admin lint && pnpm --filter @korfbaltools/admin build && pnpm --filter @korfbaltools/main typecheck && pnpm --filter @korfbaltools/main lint`

Expected: all exit 0.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/components/club-edit-form.tsx "apps/admin/src/app/clubs/[id]/page.tsx" apps/admin/src/components/users-table.tsx apps/main/src/app/api/admin/clubs/route.ts
git commit -m "revert(admin): restore /clubs/[id] to its pre-\"Mijn club\" admin-only state"
```

---

### Task 5: Full monorepo verification

**Files:** none (verification only).

- [ ] **Step 1: Full typecheck/lint/build**

Run: `pnpm typecheck && pnpm lint && pnpm build`

Expected: all exit 0.

- [ ] **Step 2: Manual browser walkthrough (requires a club-beheerder login)**

Log in as a club-beheerder on `korfbaltools.nl`, and verify:

1. The account dropdown shows "Mijn club"; clicking it opens `/mijn-club` directly (no `/admin` involved, no page reload bounce through another app's domain if deployed separately).
2. The page shows the club name, status badge, any pending join-requests with working Goedkeuren/Afwijzen, and the members table with working Rol- and Clubrol-selects (no "admin" option in Rol).
3. Changing a member's role or clubrol persists after a page refresh.
4. Demoting the last remaining beheerder shows an alert with the existing guard message.
5. Manually navigating to `/mijn-club` as a plain (non-beheerder) user or as a platform-admin → redirected to `/`.

Log in as a platform-admin on the admin app, and verify:

6. `/clubs` list and `/clubs/[id]` work exactly as before this whole "Mijn club" project started: naam/code editable, Activeren/Deactiveren/Verwijderen present, no Clubrol column changes, no join-requests table on that page.
7. A club-beheerder navigating directly to `apps/admin`'s `/clubs/[id]` (if they still know the URL) now gets the plain `requireAdmin` rejection (redirect to `/unauthorized`), same as any other non-admin — no scoped access remains there.

Expected: all seven behaviors match; no console errors.

- [ ] **Step 3: Report results**

If any step fails, fix the relevant task's file before considering this plan done.
