"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, X } from "lucide-react";
import type {
  ApiErrorBody,
  VastspelenFixture,
  VastspelenSeasonPeriod,
  VastspelenTeamNiveau,
} from "@korfbaltools/types";

const INPUT_CLASS = "rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none";

async function parseError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error.message ?? "Er ging iets mis";
}

interface WedstrijdenManagerProps {
  initialFixtures: VastspelenFixture[];
  initialSeasonPeriods: VastspelenSeasonPeriod[];
}

export function WedstrijdenManager({ initialFixtures, initialSeasonPeriods }: WedstrijdenManagerProps) {
  const [showSeasonPeriodForm, setShowSeasonPeriodForm] = useState(initialSeasonPeriods.length === 0);
  const [showFixtureForm, setShowFixtureForm] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Seizoensperiodes</h2>
          <button
            type="button"
            onClick={() => setShowSeasonPeriodForm((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-paper"
          >
            {showSeasonPeriodForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Periode
          </button>
        </div>
        {showSeasonPeriodForm && <SeasonPeriodForm onDone={() => setShowSeasonPeriodForm(false)} />}
        {initialSeasonPeriods.length === 0 ? (
          <p className="text-sm text-neutral-500">Nog geen seizoensperiodes aangemaakt.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {initialSeasonPeriods.map((period) => (
              <li key={period.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-neutral-900">
                  {period.naam} ({period.seizoensdeel})
                </span>
                <span className="text-neutral-500">{period.totaalWedstrijden} wedstrijden</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Wedstrijden</h2>
          <button
            type="button"
            onClick={() => setShowFixtureForm((v) => !v)}
            disabled={initialSeasonPeriods.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-paper disabled:opacity-50"
          >
            {showFixtureForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Wedstrijd
          </button>
        </div>
        {showFixtureForm && (
          <FixtureForm seasonPeriods={initialSeasonPeriods} onDone={() => setShowFixtureForm(false)} />
        )}

        {initialFixtures.length === 0 ? (
          <p className="text-sm text-neutral-500">Nog geen wedstrijden aangemaakt.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {initialFixtures.map((fixture) => (
              <li key={fixture.id} className="flex items-center justify-between py-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-neutral-900">
                    {fixture.teamNiveau === 1 ? "1e team" : "2e team"} — speelweek {fixture.speelweek} vs.{" "}
                    {fixture.tegenstander}
                  </span>
                  <span className="text-neutral-500">{new Date(fixture.datum).toLocaleDateString("nl-NL")}</span>
                </div>
                <Link href={`/wedstrijden/${fixture.id}`} className="text-primary underline">
                  {fixture.gespeeld ? "Minuten bewerken" : "Minuten invoeren"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SeasonPeriodForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [seizoensdeel, setSeizoensdeel] = useState<"veld" | "zaal">("veld");
  const [start, setStart] = useState("");
  const [eind, setEind] = useState("");
  const [totaalWedstrijden, setTotaalWedstrijden] = useState(20);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/vastspelen/season-periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, seizoensdeel, start, eind, totaalWedstrijden }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2 rounded-md border border-neutral-200 bg-paper p-3 sm:grid-cols-2">
      <input
        className={INPUT_CLASS}
        placeholder="Naam (bv. Veld 2026)"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        required
      />
      <select className={INPUT_CLASS} value={seizoensdeel} onChange={(e) => setSeizoensdeel(e.target.value as "veld" | "zaal")}>
        <option value="veld">Veld</option>
        <option value="zaal">Zaal</option>
      </select>
      <input className={INPUT_CLASS} type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
      <input className={INPUT_CLASS} type="date" value={eind} onChange={(e) => setEind(e.target.value)} required />
      <input
        className={INPUT_CLASS}
        type="number"
        min={1}
        placeholder="Totaal aantal wedstrijden"
        value={totaalWedstrijden}
        onChange={(e) => setTotaalWedstrijden(Number(e.target.value))}
        required
      />
      {error && <p className="col-span-full text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="col-span-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Periode aanmaken
      </button>
    </form>
  );
}

function FixtureForm({ seasonPeriods, onDone }: { seasonPeriods: VastspelenSeasonPeriod[]; onDone: () => void }) {
  const router = useRouter();
  const [teamNiveau, setTeamNiveau] = useState<VastspelenTeamNiveau>(1);
  const [seasonPeriodId, setSeasonPeriodId] = useState(seasonPeriods[0]?.id ?? "");
  const [tegenstander, setTegenstander] = useState("");
  const [datum, setDatum] = useState("");
  const [poule, setPoule] = useState("");
  const [speelweek, setSpeelweek] = useState(1);
  const [wedstrijdduur, setWedstrijdduur] = useState(60);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/vastspelen/fixtures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamNiveau, seasonPeriodId, tegenstander, datum, poule, speelweek, wedstrijdduur }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await parseError(response));
      return;
    }
    onDone();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-2 rounded-md border border-neutral-200 bg-paper p-3 sm:grid-cols-2">
      <select
        className={INPUT_CLASS}
        value={teamNiveau}
        onChange={(e) => setTeamNiveau(Number(e.target.value) as VastspelenTeamNiveau)}
      >
        <option value={1}>1e team</option>
        <option value={2}>2e team</option>
      </select>
      <select className={INPUT_CLASS} value={seasonPeriodId} onChange={(e) => setSeasonPeriodId(e.target.value)} required>
        {seasonPeriods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.naam}
          </option>
        ))}
      </select>
      <input
        className={INPUT_CLASS}
        placeholder="Tegenstander"
        value={tegenstander}
        onChange={(e) => setTegenstander(e.target.value)}
        required
      />
      <input className={INPUT_CLASS} type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required />
      <input className={INPUT_CLASS} placeholder="Poule (optioneel)" value={poule} onChange={(e) => setPoule(e.target.value)} />
      <input
        className={INPUT_CLASS}
        type="number"
        min={1}
        placeholder="Speelweek"
        value={speelweek}
        onChange={(e) => setSpeelweek(Number(e.target.value))}
        required
      />
      <input
        className={INPUT_CLASS}
        type="number"
        min={1}
        placeholder="Wedstrijdduur (minuten)"
        value={wedstrijdduur}
        onChange={(e) => setWedstrijdduur(Number(e.target.value))}
        required
      />
      {error && <p className="col-span-full text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="col-span-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Wedstrijd aanmaken
      </button>
    </form>
  );
}
