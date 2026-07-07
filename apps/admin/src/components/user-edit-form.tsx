"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ROLES, type ApiErrorBody, type Capability, type Club, type Role, type User } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { CapabilitiesSelect } from "@/components/capabilities-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_CLUB = "none";

interface UserEditFormProps {
  user: User;
  clubs: Pick<Club, "id" | "naam">[];
}

export function UserEditForm({ user, clubs }: UserEditFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  async function changeCapabilities(capabilities: Capability[]) {
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
      body: JSON.stringify({ clubId: clubId === NO_CLUB ? null : clubId }),
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
    setResetOpen(false);
  }

  async function changeStatus(deactivated: boolean) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deactivated }),
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

  async function deleteUser() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-neutral-200 p-6">
      <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-md bg-neutral-50 p-4 text-sm">
        <div>
          <div className="text-xs text-neutral-500">ID</div>
          <div className="font-mono text-xs">{user.id}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">E-mail</div>
          <div>{user.email}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Aangemaakt</div>
          <div>{new Date(user.createdAt).toLocaleString("nl-NL")}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Laatste inlog</div>
          <div>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("nl-NL") : "—"}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500">Status</div>
          <div>
            {user.deactivatedAt ? `Gedeactiveerd sinds ${new Date(user.deactivatedAt).toLocaleString("nl-NL")}` : "Actief"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Rol</Label>
          <Select defaultValue={user.role} disabled={pending} onValueChange={(value) => changeRole(value as Role)}>
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Capabilities</Label>
          <CapabilitiesSelect value={user.capabilities} disabled={pending} onChange={changeCapabilities} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="club">Club</Label>
          <Select defaultValue={user.clubId ?? NO_CLUB} disabled={pending} onValueChange={changeClub}>
            <SelectTrigger id="club">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CLUB}>Geen club</SelectItem>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id}>
                  {club.naam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 border-t border-neutral-200 pt-4">
        <Button disabled={pending} variant="outline" onClick={() => setResetOpen(true)}>
          Wachtwoord resetten
        </Button>
        {user.deactivatedAt ? (
          <Button disabled={pending} variant="outline" onClick={() => changeStatus(false)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activeren
          </Button>
        ) : (
          <Button disabled={pending} variant="destructive" onClick={() => setDeactivateOpen(true)}>
            Deactiveren
          </Button>
        )}
        <Button disabled={pending} variant="destructive" onClick={() => setDeleteOpen(true)}>
          Verwijderen
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wachtwoord resetten</DialogTitle>
            <DialogDescription>Voor {user.email}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button disabled={pending} onClick={() => resetPassword("reset_link")}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset-link versturen
            </Button>
            <Button disabled={pending} variant="outline" onClick={() => resetPassword("temporary_password")}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              {user.email} kan hierna niet meer inloggen. Dit kan later ongedaan gemaakt worden via &quot;Activeren&quot;.
            </DialogDescription>
          </DialogHeader>
          <Button disabled={pending} variant="destructive" onClick={() => changeStatus(true)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ja, deactiveren
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gebruiker verwijderen</DialogTitle>
            <DialogDescription>
              {user.email} en alle bijbehorende gegevens worden definitief verwijderd. Dit kan niet ongedaan gemaakt
              worden. Weet je het zeker?
            </DialogDescription>
          </DialogHeader>
          <Button disabled={pending} variant="destructive" onClick={deleteUser}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ja, definitief verwijderen
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
