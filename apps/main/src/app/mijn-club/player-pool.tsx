"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Player } from "@korfbaltools/types";
import { PlayerCard } from "./player-card";

interface PlayerPoolProps {
  players: Player[];
}

export function PlayerPool({ players }: PlayerPoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });

  return (
    <div className="flex w-full flex-col gap-2 lg:w-64 lg:shrink-0">
      <h3 className="text-sm font-medium text-neutral-700">
        Onverdeeld <span className="font-normal text-neutral-400">{players.length}</span>
      </h3>
      <div
        ref={setNodeRef}
        className={`flex min-h-32 flex-col gap-2 rounded-lg border p-3 transition-colors ${
          isOver ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-neutral-50"
        }`}
      >
        {players.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">Alle spelers ingedeeld</p>
        ) : (
          players.map((player) => <PlayerCard key={player.id} player={player} />)
        )}
      </div>
    </div>
  );
}
