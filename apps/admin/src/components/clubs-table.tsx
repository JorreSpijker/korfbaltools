"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Plus } from "lucide-react";
import type { ApiErrorBody } from "@korfbaltools/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface AdminClub {
  id: string;
  naam: string;
  userCount: number;
}

const INPUT_CLASS =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

interface ClubsTableProps {
  clubs: AdminClub[];
}

export function ClubsTable({ clubs }: ClubsTableProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-end">
        <CreateClubDialog />
      </div>

      {clubs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 py-16 text-center">
          <Building2 className="h-8 w-8 text-neutral-400" />
          <p className="font-medium text-neutral-900">Nog geen clubs</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Gebruikers</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clubs.map((club) => (
              <ClubRow key={club.id} club={club} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function CreateClubDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [naam, setNaam] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    setNaam("");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe club
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Club aanmaken</DialogTitle>
          <DialogDescription>Voeg een nieuwe club toe.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-club-naam">Naam</Label>
            <input
              id="new-club-naam"
              required
              value={naam}
              onChange={(event) => setNaam(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aanmaken
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClubRow({ club }: { club: AdminClub }) {
  const router = useRouter();
  const [naam, setNaam] = useState(club.naam);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dirty = naam.trim() !== "" && naam !== club.naam;

  async function save() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/admin/clubs/${club.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
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
    setDeleteOpen(false);
    router.refresh();
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-1">
          <input
            value={naam}
            onChange={(event) => setNaam(event.target.value)}
            disabled={pending}
            className={INPUT_CLASS}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="neutral">{club.userCount}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={!dirty || pending} onClick={save}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Opslaan
          </Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={pending}>
                Verwijderen
              </Button>
            </DialogTrigger>
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
      </TableCell>
    </TableRow>
  );
}
