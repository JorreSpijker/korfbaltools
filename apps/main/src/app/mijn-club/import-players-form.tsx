"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody } from "@korfbaltools/types";
import { Button } from "@/components/ui/button";
import { parsePlayersFile, type ParsedPlayer } from "./import-players";

export function ImportPlayersForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedPlayer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    setError(null);
    try {
      const players = await parsePlayersFile(file);
      setPreview(players);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function confirmImport() {
    if (!preview) return;
    setPending(true);
    setError(null);
    const response = await fetch("/api/mijn-club/players/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: preview }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    setPreview(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
        + Excel/CSV
      </Button>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
      {error && <p className="text-xs text-danger">{error}</p>}
      {preview && (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3">
          <p className="text-sm font-medium text-neutral-900">{preview.length} spelers gevonden</p>
          <ul className="max-h-40 overflow-y-auto text-sm text-neutral-700">
            {preview.map((player, index) => (
              <li key={index}>
                {player.naam} ({player.geslacht})
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button size="sm" disabled={pending} onClick={confirmImport}>
              Importeren
            </Button>
            <Button size="sm" variant="outline" disabled={pending} onClick={() => setPreview(null)}>
              Annuleren
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
