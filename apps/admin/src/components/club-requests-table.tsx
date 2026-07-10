"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCheck } from "lucide-react";
import type { ApiErrorBody } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ClubRequest {
  id: string;
  email: string;
  naam: string | null;
  pendingClubId: string | null;
  pendingClubNaam: string;
}

interface ClubRequestsTableProps {
  requests: ClubRequest[];
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
            <TableHead>Club</TableHead>
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

function ClubRequestRow({ request }: { request: ClubRequest }) {
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
      <TableCell>{request.pendingClubNaam}</TableCell>
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
