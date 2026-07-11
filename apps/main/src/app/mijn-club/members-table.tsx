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
