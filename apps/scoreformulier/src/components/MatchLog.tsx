"use client";

import { useState } from "react";
import type { SchotPoging, TegenDoelpunt, ScoreType, SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { useMatch } from "@/lib/use-match";

interface MatchLogProps {
  wedstrijdId: string;
}

type LogRegel = { soort: "schotpoging"; item: SchotPoging } | { soort: "tegendoelpunt"; item: TegenDoelpunt };

function naarLogRegels(schotpogingen: SchotPoging[], tegendoelpunten: TegenDoelpunt[]): LogRegel[] {
  const regels: LogRegel[] = [
    ...schotpogingen.map((item) => ({ soort: "schotpoging" as const, item })),
    ...tegendoelpunten.map((item) => ({ soort: "tegendoelpunt" as const, item })),
  ];
  return regels.sort((a, b) => a.item.helft - b.item.helft || a.item.minuut - b.item.minuut);
}

const SCORE_TYPES: ScoreType[] = ["afstand", "doorloop", "strafworp"];

export function MatchLog({ wedstrijdId }: MatchLogProps) {
  const { state, geladen, wijzigSchotPoging, verwijderSchotPoging, wijzigTegenDoelpunt, verwijderTegenDoelpunt } =
    useMatch(wedstrijdId);
  const [bewerkId, setBewerkId] = useState<string | null>(null);

  if (!geladen) return <p className="text-sm text-neutral-500">Laden...</p>;

  const regels = naarLogRegels(state.schotpogingen, state.tegendoelpunten);

  if (regels.length === 0) {
    return <p className="text-sm text-neutral-500">Nog geen acties gelogd.</p>;
  }

  return (
    <ul className="flex w-full flex-col divide-y divide-neutral-100">
      {regels.map((regel) => (
        <li key={regel.item.id} className="flex flex-col gap-2 py-3">
          {bewerkId === regel.item.id ? (
            regel.soort === "schotpoging" ? (
              <SchotPogingBewerkRij
                poging={regel.item}
                onOpslaan={(poging) => {
                  void wijzigSchotPoging(poging);
                  setBewerkId(null);
                }}
                onAnnuleren={() => setBewerkId(null)}
              />
            ) : (
              <TegenDoelpuntBewerkRij
                doelpunt={regel.item}
                onOpslaan={(doelpunt) => {
                  void wijzigTegenDoelpunt(doelpunt);
                  setBewerkId(null);
                }}
                onAnnuleren={() => setBewerkId(null)}
              />
            )
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-900">
                Helft {regel.item.helft}, min {regel.item.minuut} —{" "}
                {regel.soort === "schotpoging"
                  ? `${regel.item.schutterNaam} (${regel.item.scoreType}, ${regel.item.resultaat})`
                  : `Tegendoelpunt (${regel.item.verdedigerNaam} gepasseerd)`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setBewerkId(regel.item.id)}
                >
                  Bewerken
                </button>
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() =>
                    void (regel.soort === "schotpoging"
                      ? verwijderSchotPoging(regel.item.id)
                      : verwijderTegenDoelpunt(regel.item.id))
                  }
                >
                  Verwijderen
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function SchotPogingBewerkRij({
  poging,
  onOpslaan,
  onAnnuleren,
}: {
  poging: SchotPoging;
  onOpslaan: (poging: SchotPoging) => void;
  onAnnuleren: () => void;
}) {
  const [schutterNaam, setSchutterNaam] = useState(poging.schutterNaam);
  const [minuut, setMinuut] = useState(poging.minuut);
  const [scoreType, setScoreType] = useState<ScoreType>(poging.scoreType);
  const [resultaat, setResultaat] = useState<SchotResultaat>(poging.resultaat);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={schutterNaam}
        onChange={(e) => setSchutterNaam(e.target.value)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        value={minuut}
        onChange={(e) => setMinuut(Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <select
        value={scoreType}
        onChange={(e) => setScoreType(e.target.value as ScoreType)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      >
        {SCORE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <select
        value={resultaat}
        onChange={(e) => setResultaat(e.target.value as SchotResultaat)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      >
        <option value="raak">raak</option>
        <option value="mis">mis</option>
      </select>
      <button
        type="button"
        className="text-xs text-primary hover:underline"
        onClick={() =>
          onOpslaan({ ...poging, schutterNaam, minuut, scoreType, resultaat, gewijzigdOp: new Date().toISOString() })
        }
      >
        Opslaan
      </button>
      <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={onAnnuleren}>
        Annuleren
      </button>
    </div>
  );
}

function TegenDoelpuntBewerkRij({
  doelpunt,
  onOpslaan,
  onAnnuleren,
}: {
  doelpunt: TegenDoelpunt;
  onOpslaan: (doelpunt: TegenDoelpunt) => void;
  onAnnuleren: () => void;
}) {
  const [verdedigerNaam, setVerdedigerNaam] = useState(doelpunt.verdedigerNaam);
  const [minuut, setMinuut] = useState(doelpunt.minuut);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={verdedigerNaam}
        onChange={(e) => setVerdedigerNaam(e.target.value)}
        className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        type="number"
        value={minuut}
        onChange={(e) => setMinuut(Number(e.target.value))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        className="text-xs text-primary hover:underline"
        onClick={() => onOpslaan({ ...doelpunt, verdedigerNaam, minuut, gewijzigdOp: new Date().toISOString() })}
      >
        Opslaan
      </button>
      <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={onAnnuleren}>
        Annuleren
      </button>
    </div>
  );
}
