"use client";

import { useState } from "react";
import { calculateAgeYears } from "@/utils/dateUtils";
import type { Player } from "@/types";

interface AgeBandwidthBarProps {
  players: Player[];
  maxSpread: number;
}

export default function AgeBandwidthBar({ players, maxSpread }: AgeBandwidthBarProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const entries = players
    .map(p => {
      const age = calculateAgeYears(p.birthdate);
      return age === null ? null : { age, gender: p.gender, name: p.name };
    })
    .filter((e): e is { age: number; gender: Player["gender"]; name: string } => e !== null);

  if (entries.length === 0) return null;

  const minAge = Math.min(...entries.map(e => e.age));
  const maxAge = Math.max(...entries.map(e => e.age));
  const spread = maxAge - minAge;
  const exceeded = spread > maxSpread;

  // visible range: from floor(minAge) to ceil(minAge + maxSpread + padding)
  const rangeStart = Math.floor(minAge * 2) / 2;
  const rangeEnd = Math.max(maxAge, rangeStart + maxSpread) + 0.5;
  const rangeTotal = rangeEnd - rangeStart;

  const toPercent = (age: number) => ((age - rangeStart) / rangeTotal) * 100;

  const barLeft = toPercent(minAge);
  const barRight = 100 - toPercent(maxAge);
  const allowedRight = 100 - toPercent(rangeStart + maxSpread);

  return (
    <div className="px-4 pb-3 pt-1">
      <div className="relative h-8">
        {/* allowed bandwidth ghost */}
        <div
          className="absolute top-3 h-2 rounded-full bg-green-100 border border-green-200"
          style={{ left: `${toPercent(rangeStart)}%`, right: `${Math.max(0, allowedRight)}%` }}
        />

        {/* actual spread bar */}
        {entries.length >= 2 && (
          <div
            className={`absolute top-3 h-2 rounded-full ${exceeded ? "bg-red-400" : "bg-green-400"}`}
            style={{ left: `${barLeft}%`, right: `${barRight}%` }}
          />
        )}

        {/* player dots */}
        {entries.map((e, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
            style={{ left: `${toPercent(e.age)}%`, top: "10px" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            role="img"
            aria-label={`${e.name} — ${e.age.toFixed(1)} jaar`}
          >
            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-default ${
              e.gender === "f" ? "bg-pink-400" : "bg-blue-400"
            }`} />
            {hovered === i && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg pointer-events-none" aria-hidden="true">
                {e.name} — {e.age.toFixed(1)}j
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            )}
          </div>
        ))}

        {/* age labels */}
        <span
          className="absolute top-6 text-[10px] text-gray-400 -translate-x-1/2"
          style={{ left: `${toPercent(minAge)}%` }}
        >
          {minAge.toFixed(1)}j
        </span>
        {entries.length >= 2 && (
          <span
            className="absolute top-6 text-[10px] text-gray-400 -translate-x-1/2"
            style={{ left: `${toPercent(maxAge)}%` }}
          >
            {maxAge.toFixed(1)}j
          </span>
        )}
      </div>
    </div>
  );
}
