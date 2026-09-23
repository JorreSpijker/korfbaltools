"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, TeamType } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";

const INPUT_CLASS =
  "h-9 rounded-md border border-line bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

export function AddTeamForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [naam, setNaam] = useState("");
  const [type, setType] = useState<TeamType>("jeugd");
  const [categorie, setCategorie] = useState("A");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/mijn-club/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, type, categorie }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    setNaam("");
    setCategorie("A");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + Team
      </Button>
    );
  }

  return (
    <form className="flex flex-wrap items-end gap-2 rounded-lg border border-line bg-white p-3" onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted" htmlFor="team-naam">
          Naam
        </label>
        <input id="team-naam" required value={naam} onChange={(e) => setNaam(e.target.value)} className={INPUT_CLASS} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted" htmlFor="team-type">
          Type
        </label>
        <select id="team-type" value={type} onChange={(e) => setType(e.target.value as TeamType)} className={INPUT_CLASS}>
          <option value="jeugd">Jeugd</option>
          <option value="senioren">Senioren</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted" htmlFor="team-categorie">
          Categorie
        </label>
        <select
          id="team-categorie"
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button size="sm" type="submit" disabled={pending}>
        Aanmaken
      </Button>
      <Button size="sm" variant="outline" type="button" onClick={() => setOpen(false)}>
        Annuleren
      </Button>
    </form>
  );
}
