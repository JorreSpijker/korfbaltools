"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type {
  ApiErrorBody,
  VastspelenAppearance,
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
  gespeeld: boolean;
  minuten: number;
  gespeeldInTeamNiveau: VastspelenTeamNiveau;
}

interface AppearancesFormProps {
  fixture: VastspelenFixture;
  players: VastspelenPlayer[];
  initialAppearances: VastspelenAppearance[];
}

export function AppearancesForm({ fixture, players, initialAppearances }: AppearancesFormProps) {
  const router = useRouter();
  const appearanceByPlayer = new Map(initialAppearances.map((a) => [a.playerId, a]));

  const [rows, setRows] = useState<Record<string, RowState>>(
    Object.fromEntries(
      players.map((player) => {
        const appearance = appearanceByPlayer.get(player.id);
        return [
          player.id,
          {
            gespeeld: Boolean(appearance),
            minuten: appearance?.minuten ?? fixture.wedstrijdduur,
            gespeeldInTeamNiveau: appearance?.gespeeldInTeamNiveau ?? player.teamNiveau,
          },
        ];
      }),
    ),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(playerId: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [playerId]: { ...(prev[playerId] as RowState), ...patch } }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const appearances = Object.entries(rows)
      .filter(([, row]) => row.gespeeld)
      .map(([playerId, row]) => ({
        playerId,
        gespeeldInTeamNiveau: row.gespeeldInTeamNiveau,
        minuten: row.minuten,
      }));

    const response = await fetch(`/api/vastspelen/fixtures/${fixture.id}/appearances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appearances }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3">
      <div className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200">
        {players.map((player) => {
          const row = rows[player.id] as RowState;
          return (
            <div key={player.id} className="flex flex-wrap items-center gap-3 p-3">
              <label className="flex flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.gespeeld}
                  onChange={(e) => updateRow(player.id, { gespeeld: e.target.checked })}
                />
                <span className="text-neutral-900">
                  {player.naam} <span className="text-neutral-500">({player.teamNiveau === 1 ? "1e" : "2e"})</span>
                </span>
              </label>
              <select
                className={INPUT_CLASS}
                value={row.gespeeldInTeamNiveau}
                disabled={!row.gespeeld}
                onChange={(e) => updateRow(player.id, { gespeeldInTeamNiveau: Number(e.target.value) as VastspelenTeamNiveau })}
              >
                <option value={1}>Gespeeld in 1e team</option>
                <option value={2}>Gespeeld in 2e team</option>
              </select>
              <input
                className={`${INPUT_CLASS} w-24`}
                type="number"
                min={0}
                disabled={!row.gespeeld}
                value={row.minuten}
                onChange={(e) => updateRow(player.id, { minuten: Number(e.target.value) })}
              />
              <span className="text-sm text-neutral-500">min.</span>
            </div>
          );
        })}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Minuten opslaan
      </button>
    </form>
  );
}
