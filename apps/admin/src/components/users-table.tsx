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

export function UsersTable({ users, clubs, showBeheerderBadge, editableRoles, editableClubRol }: UsersTableProps) {
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
          <TableHead>Rol</TableHead>
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
    </Table>
  );
}

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

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(`/users/${user.id}`)}>
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
      <TableCell onClick={(event) => event.stopPropagation()}>
        {editableRoles ? (
          <Select defaultValue={user.role} disabled={pending} onValueChange={(value) => changeRole(value as Role)}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {editableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={user.role === "admin" ? "default" : "neutral"}>{user.role}</Badge>
        )}
      </TableCell>
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
      <TableCell className="max-w-36 truncate">{clubNaam}</TableCell>
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
  );
}
