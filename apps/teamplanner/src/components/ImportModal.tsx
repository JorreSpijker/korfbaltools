"use client";

import { useState } from "react";
import Modal from "./Modal";
import { parseExcelFile } from "@/utils/importHelpers";
import type { Player, PlannerState } from "@/types";

interface ImportModalProps {
  onNewPlan: (players: Player[]) => void;
  onAddPlayers: (players: Player[]) => void;
  onImportJSON: (state: PlannerState) => void;
  onClose: () => void;
}

export default function ImportModal({ onNewPlan, onAddPlayers, onImportJSON, onClose }: ImportModalProps) {
  const [tab, setTab] = useState<"excel" | "json">("excel");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Player[] | null>(null);
  const [pendingPlayers, setPendingPlayers] = useState<Player[] | null>(null);
  const [pendingJSON, setPendingJSON] = useState<PlannerState | null>(null);

  const handleExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const players = await parseExcelFile(file);
      setPendingPlayers(players);
      setPreview(players);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as PlannerState;
        if (!data.players || !data.teams) throw new Error("Ongeldig JSON formaat. Verwacht: { players, teams }");
        setPendingJSON(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    reader.readAsText(file);
  };

  const confirmNewPlan = () => {
    if (pendingPlayers) {
      onNewPlan(pendingPlayers);
      onClose();
    }
  };

  const confirmAddPlayers = () => {
    if (pendingPlayers) {
      onAddPlayers(pendingPlayers);
      onClose();
    }
  };

  const confirmJSON = () => {
    if (pendingJSON) {
      onImportJSON(pendingJSON);
      onClose();
    }
  };

  return (
    <Modal titleId="import-title" onClose={onClose} className="p-6 w-[520px] max-h-[85vh] overflow-y-auto">
      <h2 id="import-title" className="text-lg font-bold text-gray-900 mb-4">Nieuwe teamindeling</h2>

      <div role="tablist" aria-label="Importeer methode" className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg">
        {(["excel", "json"] as const).map(t => (
          <button
            key={t}
            id={`import-tab-${t}`}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`import-panel-${t}`}
            onClick={() => { setTab(t); setError(""); setPreview(null) }}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "excel" ? "Excel importeren" : "JSON importeren"}
          </button>
        ))}
      </div>

      {tab === "excel" && (
        <div id="import-panel-excel" role="tabpanel" aria-labelledby="import-tab-excel">
          <p className="text-sm text-gray-500 mb-3">
            Excel bestand met kolommen: <strong>naam</strong>, <strong>geboortedatum</strong>, <strong>geslacht</strong> (m/v of man/vrouw).
          </p>
          <label htmlFor="excel-file-input" className="sr-only">Selecteer Excel bestand (.xlsx, .xls, .csv)</label>
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelFile}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-surface file:text-accent hover:file:bg-accent-subtle cursor-pointer"
          />
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          {preview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">{preview.length} spelers gevonden:</p>
              <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Naam</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Geboortedatum</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Geslacht</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-1.5">{p.name}</td>
                        <td className="px-3 py-1.5">{p.birthdate}</td>
                        <td className="px-3 py-1.5">{p.gender === "f" ? "♀ Vrouw" : "♂ Man"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-amber-700 mt-3">
                Let op: &ldquo;Nieuwe indeling starten&rdquo; wist je huidige spelers en teams.
              </p>
              <div className="flex justify-end gap-3 mt-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Annuleren</button>
                <button
                  onClick={confirmAddPlayers}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  Toevoegen aan lijst
                </button>
                <button
                  onClick={confirmNewPlan}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Nieuwe indeling starten
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "json" && (
        <div id="import-panel-json" role="tabpanel" aria-labelledby="import-tab-json">
          <p className="text-sm text-gray-500 mb-3">
            Importeer eerder geëxporteerde JSON teamindeling. Laadt spelers én teams.
          </p>
          <label htmlFor="json-file-input" className="sr-only">Selecteer JSON bestand</label>
          <input
            id="json-file-input"
            type="file"
            accept=".json"
            onChange={handleJSONFile}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-surface file:text-accent hover:file:bg-accent-subtle cursor-pointer"
          />
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
          {pendingJSON && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm font-medium text-amber-900 mb-0.5">
                Gevonden: {pendingJSON.players.length} spelers, {pendingJSON.teams.length} teams
              </p>
              <p className="text-xs text-amber-700 mb-3">
                Dit vervangt je huidige indeling volledig.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPendingJSON(null)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Annuleren
                </button>
                <button
                  onClick={confirmJSON}
                  className="px-4 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark font-medium"
                >
                  Importeren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!preview && (
        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Sluiten</button>
        </div>
      )}
    </Modal>
  );
}
