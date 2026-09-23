"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Player } from "@korfbaltools/types";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-between rounded-md border border-line bg-white px-3 py-2 text-sm shadow-sm ${
        isDragging ? "opacity-50" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <span className="truncate font-medium text-ink">{player.naam}</span>
      <span className="text-xs text-outline">{player.geslacht}</span>
    </div>
  );
}
