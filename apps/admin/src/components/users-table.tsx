"use client";

import { useRouter } from "next/navigation";
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
            <TableCell>{user.naam ?? "—"}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
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
            <TableCell>{user.clubId ? (clubNameById.get(user.clubId) ?? "—") : "—"}</TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleString("nl-NL")}</TableCell>
            <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("nl-NL") : "—"}</TableCell>
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
