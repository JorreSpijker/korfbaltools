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
}

export function UsersTable({ users, clubs }: UsersTableProps) {
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
          <TableHead>Rol</TableHead>
          <TableHead>Capabilities</TableHead>
          <TableHead>Club</TableHead>
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
            <TableCell>
              <Badge variant={user.role === "admin" ? "default" : "neutral"}>{user.role}</Badge>
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
            <TableCell className="max-w-36 truncate">
              {user.clubId ? (clubNameById.get(user.clubId) ?? "—") : "—"}
            </TableCell>
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
