"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Wedstrijd } from "@korfbaltools/scoreformulier-logic";
import { listWedstrijden, saveWedstrijd } from "@/lib/db";

function vandaag(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MatchStartForm() {
  const router = useRouter();
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [datum, setDatum] = useState(vandaag());
  const [tegenstander, setTegenstander] = useState("");
  const [teamNamenTekst, setTeamNamenTekst] = useState("");

  useEffect(() => {
    void listWedstrijden().then(setWedstrijden);
  }, []);

  async function start() {
    const teamNamen = teamNamenTekst
      .split(",")
      .map((naam) => naam.trim())
      .filter((naam) => naam.length > 0);

    const wedstrijd: Wedstrijd = {
      id: crypto.randomUUID(),
      datum,
      tegenstander: tegenstander.trim() || null,
      teamNamen,
      status: "bezig",
      huidigeHelft: 1,
      helftGestart: false,
    };
    await saveWedstrijd(wedstrijd);
    router.push(`/wedstrijd/${wedstrijd.id}`);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Nieuwe wedstrijd</h2>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Datum
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Tegenstander (optioneel)
          <input
            type="text"
            value={tegenstander}
            onChange={(e) => setTegenstander(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Teamnamen (komma-gescheiden)
          <input
            type="text"
            value={teamNamenTekst}
            onChange={(e) => setTeamNamenTekst(e.target.value)}
            placeholder="Anna, Bram, Chris, ..."
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void start()}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Wedstrijd starten
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-neutral-900">Eerdere wedstrijden</h2>
        {wedstrijden.length === 0 ? (
          <p className="text-sm text-neutral-500">Nog geen wedstrijden.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {wedstrijden.map((wedstrijd) => (
              <li key={wedstrijd.id} className="py-2">
                <Link href={`/wedstrijd/${wedstrijd.id}`} className="text-primary hover:underline">
                  {wedstrijd.datum} {wedstrijd.tegenstander ? `vs ${wedstrijd.tegenstander}` : ""} — {wedstrijd.status}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
