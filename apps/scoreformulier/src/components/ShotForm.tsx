"use client";

import { useState } from "react";
import type { ScoreType, SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { Modal } from "./Modal";

interface ShotFormProps {
  teamNamen: string[];
  onSubmit: (input: { schutterNaam: string; scoreType: ScoreType; resultaat: SchotResultaat }) => void;
  onClose: () => void;
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

export function ShotForm({ teamNamen, onSubmit, onClose }: ShotFormProps) {
  const [schutterNaam, setSchutterNaam] = useState(teamNamen[0] ?? "");
  const [andereSchutter, setAndereSchutter] = useState("");
  const [gebruikAndere, setGebruikAndere] = useState(teamNamen.length === 0);
  const [scoreType, setScoreType] = useState<ScoreType>("afstand");

  function kiesResultaat(resultaat: SchotResultaat) {
    const naam = gebruikAndere ? andereSchutter.trim() : schutterNaam;
    if (naam.length === 0) return;
    onSubmit({ schutterNaam: naam, scoreType, resultaat });
    onClose();
  }

  return (
    <Modal titleId="shot-form-title" onClose={onClose} className="p-6">
      <h2 id="shot-form-title" className="text-lg font-semibold text-neutral-900">
        Schotpoging
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-sm text-neutral-700">
          Schutter
          {gebruikAndere ? (
            <input
              type="text"
              autoFocus
              value={andereSchutter}
              onChange={(e) => setAndereSchutter(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          ) : (
            <select
              value={schutterNaam}
              onChange={(e) => setSchutterNaam(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {teamNamen.map((naam) => (
                <option key={naam} value={naam}>
                  {naam}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="self-start text-xs text-primary hover:underline"
            onClick={() => setGebruikAndere((v) => !v)}
          >
            {gebruikAndere ? "Kies uit lijst" : "Anders..."}
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Scoretype
          <select
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value as ScoreType)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          >
            {SCORE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => kiesResultaat("raak")}
            className="flex-1 rounded-md bg-primary px-4 py-3 text-white hover:bg-primary-600"
          >
            Raak
          </button>
          <button
            type="button"
            onClick={() => kiesResultaat("mis")}
            className="flex-1 rounded-md border border-neutral-300 px-4 py-3 text-neutral-900 hover:bg-neutral-50"
          >
            Mis
          </button>
        </div>
      </div>
    </Modal>
  );
}
