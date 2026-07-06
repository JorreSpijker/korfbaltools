"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlayerCard from "./PlayerCard";
import AgeBandwidthBar from "./AgeBandwidthBar";
import { calculateAgeYears } from "@/utils/dateUtils";
import type { Player, Team, TeamCategory, UCategory } from "@/types";

const U_CAT_MIN_YEAR: Record<UCategory, number> = { U19: 2007, U17: 2009, U15: 2011 };

const COLOR_RULES = [
  { name: "Rood",   min: 14, max: 18, bg: "bg-red-100",    text: "text-red-700",    specs: "2 vakken · 3.5m · K5 · wissel per 2 doelpunten" },
  { name: "Oranje", min: 12, max: 13, bg: "bg-orange-100", text: "text-orange-700", specs: "2 vakken · 3.5m · K5 · wissel op tijd" },
  { name: "Geel",   min: 10, max: 11, bg: "bg-yellow-100", text: "text-yellow-700", specs: "2 vakken · 3m · K4 · wissel op tijd" },
  { name: "Groen",  min:  8, max:  9, bg: "bg-green-100",  text: "text-green-700",  specs: "1 vak · 3m · K4 · geen wissel" },
  { name: "Blauw",  min:  5, max:  7, bg: "bg-blue-100",   text: "text-blue-700",   specs: "1 vak · 2.5m · K3 · geen wissel" },
];

function getTeamColor(avgAge: number | null) {
  if (avgAge === null) return null;
  const age = Math.floor(avgAge);
  return COLOR_RULES.find(c => age >= c.min && age <= c.max) ?? null;
}

function getTeamStats(team: Team, allPlayers: Player[]) {
  const players = team.playerIds
    .map(id => allPlayers.find(p => p.id === id))
    .filter((p): p is Player => Boolean(p));
  const exactAges = players.map(p => calculateAgeYears(p.birthdate)).filter((v): v is number => v !== null);
  const avgAge = exactAges.length
    ? Math.round(exactAges.reduce((a, b) => a + b, 0) / exactAges.length * 10) / 10
    : null;
  const males = players.filter(p => p.gender !== "f").length;
  const females = players.filter(p => p.gender === "f").length;

  const warnings: string[] = [];

  if (team.type === "jeugd") {
    if (team.category === "B") {
      const is4tal = team.format === "4tal";
      const maxSpread = is4tal ? 2 : 3;
      if (exactAges.length >= 2) {
        const spread = Math.max(...exactAges) - Math.min(...exactAges);
        if (spread > maxSpread) {
          warnings.push(`Bandbreedte ${spread.toFixed(1)}j > max ${maxSpread}j`);
        }
      }
      if (!is4tal && avgAge !== null && avgAge < 9.0) {
        warnings.push(`Gem. leeftijd ${avgAge}j < 9.0j voor 8-tal`);
      }
    } else if (team.category === "A") {
      const minYear = team.uCategory ? U_CAT_MIN_YEAR[team.uCategory] : undefined;
      if (minYear) {
        const tooOld = players.filter(p => {
          if (!p.birthdate) return false;
          return new Date(p.birthdate).getFullYear() < minYear;
        });
        if (tooOld.length > 0) {
          warnings.push(`${tooOld.length} speler(s) te oud voor ${team.uCategory}`);
        }
      }
    }
  } else {
    if (team.category === "A") {
      if (males < 4 || females < 4) warnings.push(`${males}/4 ♂  ${females}/4 ♀`);
    } else if (team.category === "B") {
      if (players.length < 8) warnings.push(`${players.length}/8 spelers`);
    }
  }

  const valid = warnings.length === 0;
  const validMsg = valid ? "Geldig" : warnings.join(" · ");

  return { players, avgAge, males, females, valid, validMsg, exactAges };
}

interface TeamCardProps {
  team: Team;
  players: Player[];
  selectedIds?: Set<string>;
  onSelect: (playerId: string, shiftKey: boolean) => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<Team>) => void;
  onEditPlayer: (player: Player) => void;
}

export default function TeamCard({ team, players: allPlayers, selectedIds, onSelect, onRemove, onUpdate, onEditPlayer }: TeamCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id, data: { type: "team", teamId: team.id } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${team.id}-drop`,
    data: { destTeamId: team.id },
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };
  const stats = useMemo(() => getTeamStats(team, allPlayers), [team, allPlayers]);
  const color = team.type === "jeugd" ? getTeamColor(stats.avgAge) : null;
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(team.name);
  const [badgePop, setBadgePop] = useState(false);
  const prevValidRef = useRef(stats.valid);

  useEffect(() => {
    if (!prevValidRef.current && stats.valid) {
      setBadgePop(true);
      const id = setTimeout(() => setBadgePop(false), 500);
      return () => clearTimeout(id);
    }
    prevValidRef.current = stats.valid;
  }, [stats.valid]);

  useEffect(() => {
    if (!confirmRemove) return;
    const t = setTimeout(() => setConfirmRemove(false), 4000);
    return () => clearTimeout(t);
  }, [confirmRemove]);

  useEffect(() => {
    if (!editingName) setNameValue(team.name);
  }, [team.name, editingName]);

  const saveName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== team.name) onUpdate({ name: trimmed });
    else setNameValue(team.name);
    setEditingName(false);
  };

  const cancelName = () => {
    setNameValue(team.name);
    setEditingName(false);
  };

  return (
    <div
      ref={setSortableRef}
      style={sortableStyle}
      className={`bg-white rounded-xl border overflow-hidden transition-colors ${
        isOver ? "border-accent ring-2 ring-accent-surface" : "border-gray-200"
      }`}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">{stats.validMsg}</div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
        <button
          {...listeners}
          {...attributes}
          aria-label="Sleep om team te verplaatsen"
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" aria-hidden="true">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="10" r="1.5" /><circle cx="9" cy="10" r="1.5" />
            <circle cx="3" cy="17" r="1.5" /><circle cx="9" cy="17" r="1.5" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          {editingName ? (
            <input
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={saveName}
              maxLength={40}
              onKeyDown={e => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") cancelName();
              }}
              className="font-bold text-gray-900 text-base bg-white rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-accent border border-accent-subtle"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              title="Klik om naam te wijzigen"
              className="font-bold text-gray-900 text-base text-left truncate hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded w-full"
            >
              {team.name}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${
            stats.valid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          } ${badgePop ? "animate-badge-pop" : ""}`}>
            {stats.validMsg}
          </span>

          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Verwijderen?</span>
              <button
                onClick={onRemove}
                className="text-xs font-semibold text-red-600 hover:text-red-800 px-1 py-0.5"
              >
                Ja
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-1 py-0.5"
              >
                Nee
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              aria-label={`Verwijder ${team.name}`}
              className="text-gray-400 hover:text-red-500 text-xl leading-none px-1"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats band */}
      <div className="px-4 py-2.5 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200">
            <span className="font-medium text-gray-500">Cat</span>
            <select
              value={team.category}
              onChange={e => onUpdate({ category: e.target.value as TeamCategory })}
              className="bg-transparent font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-accent rounded cursor-pointer"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>

          {team.type === "jeugd" && stats.avgAge !== null && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-gray-200">
              <span className="font-medium text-gray-500 mr-1">Gem.</span>
              <span className="font-semibold text-gray-800 tabular-nums">{stats.avgAge}j</span>
            </span>
          )}

          {team.type === "jeugd" && team.category === "A" && team.uCategory && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-white border border-gray-200 font-semibold text-indigo-700">
              {team.uCategory}
            </span>
          )}

          {team.type === "jeugd" && team.category === "B" && stats.exactAges.length >= 2 && (
            <span className="relative inline-flex">
              <span
                tabIndex={0}
                className="group inline-flex items-center px-2 py-1 rounded-md bg-white border border-gray-200 cursor-help"
              >
                <span className="font-medium text-gray-500 mr-1">Bandbreedte</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                  {(Math.max(...stats.exactAges) - Math.min(...stats.exactAges)).toFixed(1)}j
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                  Max bandbreedte: {team.format === "4tal" ? "2 jaar (4-tal)" : "3 jaar (8-tal)"}
                </span>
              </span>
            </span>
          )}

          {team.type !== "jeugd" && stats.players.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200">
              <span className="text-blue-600 font-semibold tabular-nums">♂ {stats.males}</span>
              <span className="text-gray-300">/</span>
              <span className="text-pink-600 font-semibold tabular-nums">♀ {stats.females}</span>
            </span>
          )}

          {team.type === "jeugd" && team.category === "B" && color && (
            <span className="relative inline-flex">
              <span
                tabIndex={0}
                className={`group inline-flex items-center px-2 py-1 rounded-md font-medium cursor-help ${color.bg} ${color.text}`}
              >
                {color.name}
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                  {color.specs}
                </span>
              </span>
            </span>
          )}
        </div>
      </div>

      {team.type === "jeugd" && team.category === "B" && stats.players.length > 0 && (
        <AgeBandwidthBar
          players={stats.players}
          maxSpread={team.format === "4tal" ? 2 : 3}
        />
      )}

      {/* Drop zone */}
      <div
        ref={setDropRef}
        className={`p-3 flex flex-col gap-2 transition-colors ${isOver ? "bg-accent-surface" : ""}`}
      >
        {stats.players.length === 0 ? (
          <div className={`flex items-center justify-center rounded-lg border-2 border-dashed min-h-[88px] transition-colors ${
            isOver
              ? "border-accent bg-accent-surface text-accent"
              : "border-gray-200 text-gray-400"
          }`}>
            <span className="text-xs select-none">Sleep spelers hiernaartoe</span>
          </div>
        ) : (
          stats.players.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              sourceTeamId={team.id}
              isSelected={selectedIds?.has(player.id)}
              onSelect={onSelect}
              onEditPlayer={onEditPlayer}
            />
          ))
        )}
      </div>
    </div>
  );
}
