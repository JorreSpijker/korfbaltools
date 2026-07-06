"use client";

import { useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import PlayerCard from "./PlayerCard";
import { parseExcelFile } from "@/utils/importHelpers";
import type { Player } from "@/types";

interface PlayerPoolProps {
  players: Player[];
  selectedIds?: Set<string>;
  onSelect: (playerId: string, shiftKey: boolean) => void;
  onAddPlayers: (players: Player[]) => void;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export default function PlayerPool({ players, selectedIds, onSelect, onAddPlayers, onEditPlayer, onDeletePlayer }: PlayerPoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });
  const [query, setQuery] = useState("");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportError("");
    try {
      const imported = await parseExcelFile(file);
      onAddPlayers(imported);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    }
  };

  const sorted = useMemo(() =>
    [...players].sort((a, b) => {
      if (!a.birthdate) return 1;
      if (!b.birthdate) return -1;
      return new Date(a.birthdate).getTime() - new Date(b.birthdate).getTime();
    }),
    [players]
  );

  const filtered = useMemo(() =>
    query.trim()
      ? sorted.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      : sorted,
    [sorted, query]
  );

  return (
    <div className="flex flex-col lg:max-h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Beschikbaar <span className="font-normal text-gray-400">{players.length}</span>
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Importeer spelers uit Excel"
          className="text-xs text-accent hover:text-accent-dark font-medium py-2 px-1"
        >
          + Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleImport}
          className="hidden"
        />
      </div>
      {importError && (
        <p className="mb-2 text-xs text-red-600">{importError}</p>
      )}
      <label htmlFor="player-search" className="sr-only">Zoeken op naam</label>
      <input
        id="player-search"
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Zoeken..."
        className="mb-2 w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto min-h-64 bg-white rounded-xl border p-3 flex flex-col gap-2 transition-colors ${
          isOver ? "border-accent bg-accent-surface" : "border-gray-200"
        }`}
      >
        {players.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span className="text-sm font-medium text-green-700">Alle spelers ingedeeld</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Geen resultaten
          </div>
        ) : (
          filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              sourceTeamId={null}
              isSelected={selectedIds?.has(player.id)}
              onSelect={onSelect}
              onEditPlayer={onEditPlayer}
              onDeletePlayer={onDeletePlayer}
            />
          ))
        )}
      </div>
    </div>
  );
}
