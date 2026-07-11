"use client";

import { useState } from "react";
import Link from "next/link";
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
  code: string | null;
  active: boolean;
  userCount: number;
}

const INPUT_CLASS =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

interface ClubsTableProps {
  clubs: AdminClub[];
}

export function ClubsTable({ clubs }: ClubsTableProps) {
  const withMembers = clubs.filter((club) => club.userCount > 0);
  const activeEmpty = clubs.filter((club) => club.userCount === 0 && club.active);
  const inactive = clubs.filter((club) => club.userCount === 0 && !club.active);

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
              <TableHead>ClubID</TableHead>
              <TableHead>Gebruikers</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {withMembers.map((club) => (
              <ClubRow key={club.id} club={club} />
            ))}
            {activeEmpty.length > 0 && (
              <TableRow>
                <TableCell colSpan={4} className="bg-neutral-50 py-1.5 text-xs font-medium uppercase text-neutral-500">
                  Actief
                </TableCell>
              </TableRow>
            )}
            {activeEmpty.map((club) => (
              <ClubRow key={club.id} club={club} />
            ))}
            {inactive.length > 0 && (
              <TableRow>
                <TableCell colSpan={4} className="bg-neutral-50 py-1.5 text-xs font-medium uppercase text-neutral-500">
                  Niet actief
                </TableCell>
              </TableRow>
            )}
            {inactive.map((club) => (
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
  const [code, setCode] = useState("");
  const [beheerderEmail, setBeheerderEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setNaam("");
    setCode("");
    setBeheerderEmail("");
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naam,
        code,
        beheerderEmail: beheerderEmail.trim() === "" ? undefined : beheerderEmail.trim(),
      }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-club-code">ClubID</Label>
            <input
              id="new-club-code"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-club-beheerder">Beheerder e-mail (optioneel)</Label>
            <input
              id="new-club-beheerder"
              type="email"
              value={beheerderEmail}
              onChange={(event) => setBeheerderEmail(event.target.value)}
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
  const [pending, setPending] = useState(false);

  const disabled = club.userCount === 0 && !club.active;

  async function activate() {
    setPending(true);
    await fetch(`/api/admin/clubs/${club.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    setPending(false);
    router.refresh();
  }

  if (disabled) {
    return (
      <TableRow className="opacity-50">
        <TableCell className="font-medium text-neutral-900">{club.naam}</TableCell>
        <TableCell>{club.code}</TableCell>
        <TableCell>
          <Badge variant="neutral">{club.userCount}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" disabled={pending} onClick={activate}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activeren
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(`/clubs/${club.id}`)}>
      <TableCell className="font-medium text-neutral-900">
        <Link
          href={`/clubs/${club.id}`}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {club.naam}
        </Link>
      </TableCell>
      <TableCell>{club.code}</TableCell>
      <TableCell>
        <Badge variant="neutral">{club.userCount}</Badge>
      </TableCell>
      <TableCell />
    </TableRow>
  );
}
