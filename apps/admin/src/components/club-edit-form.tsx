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
