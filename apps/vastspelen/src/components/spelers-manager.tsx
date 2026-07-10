"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ApiErrorBody, VastspelenPlayer, VastspelenTeamNiveau } from "@korfbaltools/types";

const INPUT_CLASS = "rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none";

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error.message ?? "Er ging iets mis";
}

interface SpelersManagerProps {
  initialPlayers: VastspelenPlayer[];
}

export function SpelersManager({ initialPlayers }: SpelersManagerProps) {
  const teamSpelers = (niveau: VastspelenTeamNiveau) => initialPlayers.filter((p) => p.teamNiveau === niveau);

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {([1, 2] as const).map((niveau) => (
        <TeamColumn key={niveau} teamNiveau={niveau} players={teamSpelers(niveau)} />
      ))}
    </div>
  );
}

function TeamColumn({ teamNiveau, players }: { teamNiveau: VastspelenTeamNiveau; players: VastspelenPlayer[] }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">{teamNiveau === 1 ? "1e team" : "2e team"}</h2>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-paper"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Speler
        </button>
      </div>

      {showCreate && <CreatePlayerForm teamNiveau={teamNiveau} onDone={() => setShowCreate(false)} />}

      {players.length === 0 ? (
        <p className="text-sm text-neutral-500">Nog geen spelers toegevoegd.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100">
          {players.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CreatePlayerForm({ teamNiveau, onDone }: { teamNiveau: VastspelenTeamNiveau; onDone: () => void }) {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [geboortedatum, setGeboortedatum] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/vastspelen/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, geboortedatum, teamNiveau }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    setNaam("");
    setGeboortedatum("");
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-paper p-3">
      <input
        className={INPUT_CLASS}
        placeholder="Naam"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        required
      />
      <input
        className={INPUT_CLASS}
        type="date"
        value={geboortedatum}
        onChange={(e) => setGeboortedatum(e.target.value)}
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Toevoegen
      </button>
    </form>
  );
}

function PlayerRow({ player }: { player: VastspelenPlayer }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [naam, setNaam] = useState(player.naam);
  const [geboortedatum, setGeboortedatum] = useState(player.geboortedatum.slice(0, 10));
  const [teamNiveau, setTeamNiveau] = useState<VastspelenTeamNiveau>(player.teamNiveau);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch(`/api/vastspelen/players/${player.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, geboortedatum, teamNiveau }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`${player.naam} verwijderen?`)) return;
    setPending(true);
    const response = await fetch(`/api/vastspelen/players/${player.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <li className="py-2">
        <form onSubmit={save} className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-paper p-3">
          <input className={INPUT_CLASS} value={naam} onChange={(e) => setNaam(e.target.value)} required />
          <input
            className={INPUT_CLASS}
            type="date"
            value={geboortedatum}
            onChange={(e) => setGeboortedatum(e.target.value)}
            required
          />
          <select
            className={INPUT_CLASS}
            value={teamNiveau}
            onChange={(e) => setTeamNiveau(Number(e.target.value) as VastspelenTeamNiveau)}
          >
            <option value={1}>1e team</option>
            <option value={2}>2e team</option>
          </select>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
            >
              Opslaan
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm hover:bg-paper"
            >
              Annuleren
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-2">
      <span className="text-neutral-900">{player.naam}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-paper hover:text-neutral-900"
          aria-label="Bewerken"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-paper hover:text-danger"
          aria-label="Verwijderen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
