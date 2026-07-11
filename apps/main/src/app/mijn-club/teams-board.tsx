"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Player, Team } from "@korfbaltools/types";
import { PlayerPool } from "./player-pool";
import { TeamCard } from "./team-card";
import { AddTeamForm } from "./add-team-form";
import { ImportPlayersForm } from "./import-players-form";

interface TeamsBoardProps {
  teams: Team[];
  players: Player[];
}

export function TeamsBoard({ teams, players: initialPlayers }: TeamsBoardProps) {
  const [players, setPlayers] = useState(initialPlayers);
  const [dragError, setDragError] = useState<string | null>(null);

  // router.refresh() (after add-team/import/delete) re-renders this
  // component with fresh props but does not remount it — without this,
  // newly imported players wouldn't show up in the pool until a full
  // navigation.
  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const poolPlayers = players.filter((player) => player.teamId === null);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const playerId = active.id as string;
    const destTeamId = over.id === "pool" ? null : (over.id as string);
    const player = players.find((p) => p.id === playerId);
    if (!player || player.teamId === destTeamId) return;

    const previousTeamId = player.teamId;
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, teamId: destTeamId } : p)));
    setDragError(null);

    const response = await fetch(`/api/mijn-club/players/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: destTeamId }),
    });

    if (!response.ok) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, teamId: previousTeamId } : p)));
      setDragError("Kon speler niet verplaatsen");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-700">Teams</h2>
        <div className="flex gap-2">
          <ImportPlayersForm />
          <AddTeamForm />
        </div>
      </div>
      {dragError && <p className="text-xs text-danger">{dragError}</p>}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 lg:flex-row">
          <PlayerPool players={poolPlayers} />
          <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {teams.length === 0 ? (
              <p className="text-sm text-neutral-400">Nog geen teams</p>
            ) : (
              teams.map((team) => (
                <TeamCard key={team.id} team={team} players={players.filter((p) => p.teamId === team.id)} />
              ))
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
