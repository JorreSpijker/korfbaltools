"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, Player, Team } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "./player-card";

interface TeamCardProps {
  team: Team;
  players: Player[];
}

export function TeamCard({ team, players }: TeamCardProps) {
  const router = useRouter();
  const { setNodeRef, isOver } = useDroppable({ id: team.id });
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/mijn-club/teams/${team.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      setConfirmDelete(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{team.naam}</p>
          <p className="text-xs text-muted">
            {team.type === "jeugd" ? "Jeugd" : "Senioren"} · {team.categorie}
          </p>
        </div>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">
              {players.length > 0 ? "Spelers gaan terug naar de pool" : "Zeker weten?"}
            </span>
            <Button size="sm" variant="destructive" disabled={pending} onClick={remove}>
              Ja
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => setConfirmDelete(false)}>
              Nee
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)}>
            Verwijderen
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-2 rounded-md border p-2 transition-colors ${
          isOver ? "border-primary-500 bg-primary-50" : "border-line bg-tint"
        }`}
      >
        {players.length === 0 ? (
          <p className="py-4 text-center text-xs text-outline">Sleep spelers hierheen</p>
        ) : (
          players.map((player) => <PlayerCard key={player.id} player={player} />)
        )}
      </div>
    </div>
  );
}
