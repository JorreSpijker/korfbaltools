"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { CAPABILITIES, ROLES, type ApiErrorBody, type Capability, type Club, type Role, type User } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UsersTableProps {
  users: User[];
  clubs: Pick<Club, "id" | "naam">[];
}

export function UsersTable({ users, clubs }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Naam</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Capabilities</TableHead>
          <TableHead>Club</TableHead>
          <TableHead>Aangemaakt</TableHead>
          <TableHead>Laatste inlog</TableHead>
          <TableHead className="text-right">Acties</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserRow key={user.id} clubs={clubs} user={user} />
        ))}
      </TableBody>
    </Table>
  );
}

function UserRow({ user, clubs }: { user: User; clubs: Pick<Club, "id" | "naam">[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  async function changeRole(role: Role) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  async function toggleCapability(capability: Capability, checked: boolean) {
    const capabilities = checked
      ? [...user.capabilities, capability]
      : user.capabilities.filter((c) => c !== capability);

    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}/capabilities`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capabilities }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  async function changeClub(clubId: string) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}/club`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId: clubId === "" ? null : clubId }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  async function resetPassword(mode: "temporary_password" | "reset_link") {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    if (mode === "temporary_password") {
      const { temporaryPassword } = (await response.json()) as { temporaryPassword: string };
      window.alert(`Tijdelijk wachtwoord voor ${user.email}: ${temporaryPassword}`);
    }
  }

  async function deactivate() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
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
      <TableCell className="font-mono text-xs text-neutral-500">{user.id}</TableCell>
      <TableCell>{user.naam ?? "—"}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <select
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
          defaultValue={user.role}
          disabled={pending}
          onChange={(e) => changeRole(e.target.value as Role)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {CAPABILITIES.map((capability) => (
            <label key={capability} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={user.capabilities.includes(capability)}
                disabled={pending}
                onChange={(e) => toggleCapability(capability, e.target.checked)}
              />
              {capability}
            </label>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <select
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
          defaultValue={user.clubId ?? ""}
          disabled={pending}
          onChange={(e) => changeClub(e.target.value)}
        >
          <option value="">Geen club</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.naam}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleString("nl-NL")}</TableCell>
      <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("nl-NL") : "—"}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setResetOpen(true);
              }}
            >
              Reset wachtwoord
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-danger"
              onSelect={(e) => {
                e.preventDefault();
                setDeactivateOpen(true);
              }}
            >
              Deactiveren
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wachtwoord resetten</DialogTitle>
              <DialogDescription>Voor {user.email}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button disabled={pending} onClick={() => resetPassword("reset_link")}>
                Reset-link versturen
              </Button>
              <Button disabled={pending} variant="outline" onClick={() => resetPassword("temporary_password")}>
                Tijdelijk wachtwoord genereren
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gebruiker deactiveren</DialogTitle>
              <DialogDescription>
                {user.email} kan hierna niet meer inloggen. Weet je het zeker?
              </DialogDescription>
            </DialogHeader>
            <Button disabled={pending} variant="destructive" onClick={deactivate}>
              Ja, deactiveren
            </Button>
          </DialogContent>
        </Dialog>
        {error && <p className="text-xs text-danger">{error}</p>}
      </TableCell>
    </TableRow>
  );
}
