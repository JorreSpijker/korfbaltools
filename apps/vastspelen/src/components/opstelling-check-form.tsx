"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type {
  ApiErrorBody,
  VastspelenCheckResultaat,
  VastspelenFixture,
  VastspelenPlayer,
  VastspelenTeamNiveau,
} from "@korfbaltools/types";

const INPUT_CLASS = "rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm focus:outline-none";

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error.message ?? "Er ging iets mis";
}

interface RowState {
  opgesteld: boolean;
  gespeeldInTeamNiveau: VastspelenTeamNiveau;
}

interface OpstellingCheckFormProps {
  fixtures: VastspelenFixture[];
  players: VastspelenPlayer[];
}

export function OpstellingCheckForm({ fixtures, players }: OpstellingCheckFormProps) {
  const [fixtureId, setFixtureId] = useState(fixtures[0]?.id ?? "");
  const fixture = fixtures.find((f) => f.id === fixtureId) ?? fixtures[0];

  const [rows, setRows] = useState<Record<string, RowState>>(
    Object.fromEntries(players.map((player) => [player.id, { opgesteld: false, gespeeldInTeamNiveau: player.teamNiveau }])),
  );
  const [results, setResults] = useState<Record<string, VastspelenCheckResultaat> | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(playerId: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] as RowState), ...patch } }));
    setResults(null);
  }

  async function check() {
    if (!fixture) return;
    setPending(true);
    setError(null);

    const spelers = Object.entries(rows)
      .filter(([, row]) => row.opgesteld)
      .map(([playerId, row]) => ({ playerId, gespeeldInTeamNiveau: row.gespeeldInTeamNiveau }));

    const response = await fetch("/api/vastspelen/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fixtureId: fixture.id, spelers }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    const { resultaten } = (await response.json()) as { resultaten: VastspelenCheckResultaat[] };
    setResults(Object.fromEntries(resultaten.map((r) => [r.playerId, r])));
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <select className={`${INPUT_CLASS} w-fit`} value={fixtureId} onChange={(e) => { setFixtureId(e.target.value); setResults(null); }}>
        {fixtures.map((f) => (
          <option key={f.id} value={f.id}>
            {f.teamNiveau === 1 ? "1e team" : "2e team"} — speelweek {f.speelweek} vs. {f.tegenstander}
          </option>
        ))}
      </select>

      <div className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200">
        {players.map((player) => {
          const row = rows[player.id] as RowState;
          const result = results?.[player.id];
          return (
            <div key={player.id} className="flex flex-col gap-2 p-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex flex-1 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={row.opgesteld}
                    onChange={(e) => updateRow(player.id, { opgesteld: e.target.checked })}
                  />
                  <span className="text-neutral-900">
                    {player.naam} <span className="text-neutral-500">({player.teamNiveau === 1 ? "1e" : "2e"})</span>
                  </span>
                </label>
                <select
                  className={INPUT_CLASS}
                  value={row.gespeeldInTeamNiveau}
                  disabled={!row.opgesteld}
                  onChange={(e) =>
                    updateRow(player.id, { gespeeldInTeamNiveau: Number(e.target.value) as VastspelenTeamNiveau })
                  }
                >
                  <option value={1}>Opstellen in 1e team</option>
                  <option value={2}>Opstellen in 2e team</option>
                </select>
              </div>
              {result && (
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    result.toegestaan ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                  }`}
                >
                  {result.toegestaan ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {result.reden}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="button"
        onClick={check}
        disabled={pending || !fixture}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Opstelling checken
      </button>
    </div>
  );
}
