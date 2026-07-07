"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { ROLES, type ApiErrorBody, type Capability, type Club, type Role } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { CapabilitiesSelect } from "@/components/capabilities-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NO_CLUB = "none";
const INPUT_CLASS =
  "h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

interface CreateUserDialogProps {
  clubs: Pick<Club, "id" | "naam">[];
}

export function CreateUserDialog({ clubs }: CreateUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [naam, setNaam] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [clubId, setClubId] = useState(NO_CLUB);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setNaam("");
    setRole("player");
    setCapabilities([]);
    setClubId(NO_CLUB);
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        naam: naam.trim() === "" ? undefined : naam.trim(),
        role,
        capabilities,
        clubId: clubId === NO_CLUB ? null : clubId,
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
          <UserPlus className="mr-2 h-4 w-4" />
          Nieuwe gebruiker
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gebruiker uitnodigen</DialogTitle>
          <DialogDescription>
            Er wordt een account aangemaakt en een uitnodiging gestuurd om een wachtwoord in te stellen.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-email">E-mailadres</Label>
            <input
              id="new-user-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-naam">Naam</Label>
            <input
              id="new-user-naam"
              value={naam}
              onChange={(event) => setNaam(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-role">Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger id="new-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Capabilities</Label>
            <CapabilitiesSelect value={capabilities} onChange={setCapabilities} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-club">Club</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="new-user-club">
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

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Uitnodiging versturen
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
