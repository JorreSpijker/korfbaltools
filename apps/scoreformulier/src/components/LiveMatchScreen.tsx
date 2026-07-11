"use client";

import { useEffect, useRef, useState } from "react";
import { berekenStand, type ScoreType, type SchotResultaat } from "@korfbaltools/scoreformulier-logic";
import { useMatch } from "@/lib/use-match";
import { ShotForm } from "./ShotForm";
import { ConcedeForm } from "./ConcedeForm";

interface LiveMatchScreenProps {
  wedstrijdId: string;
}

export function LiveMatchScreen({ wedstrijdId }: LiveMatchScreenProps) {
  const {
    wedstrijd,
    state,
    geladen,
    startHelft,
    pauzeHelft,
    helftwissel,
    voegSchotPogingToe,
    voegTegenDoelpuntToe,
    rondAf,
  } = useMatch(wedstrijdId);
  const [toonSchotForm, setToonSchotForm] = useState(false);
  const [toonTegenForm, setToonTegenForm] = useState(false);
  const [, forceerHerrender] = useState(0);
  const helftStartTijdstip = useRef<number | null>(null);
  const minuutBijPauze = useRef(0);

  useEffect(() => {
    if (!state.helftGestart) return;
    helftStartTijdstip.current = Date.now();
    const interval = setInterval(() => forceerHerrender((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [state.helftGestart]);

  function huidigeMinuut(): number {
    if (!state.helftGestart || helftStartTijdstip.current === null) return minuutBijPauze.current;
    return minuutBijPauze.current + Math.floor((Date.now() - helftStartTijdstip.current) / 60000);
  }

  function schakelStopwatch() {
    if (state.helftGestart) {
      minuutBijPauze.current = huidigeMinuut();
      void pauzeHelft();
    } else {
      void startHelft();
    }
  }

  function wisselHelft() {
    minuutBijPauze.current = 0;
    void helftwissel();
  }

  function loggSchotPoging(input: { schutterNaam: string; scoreType: ScoreType; resultaat: SchotResultaat }) {
    void voegSchotPogingToe({
      id: crypto.randomUUID(),
      wedstrijdId,
      schutterNaam: input.schutterNaam,
      helft: state.huidigeHelft,
      minuut: huidigeMinuut(),
      scoreType: input.scoreType,
      resultaat: input.resultaat,
      aangemaaktOp: new Date().toISOString(),
      gewijzigdOp: new Date().toISOString(),
    });
  }

  function loggTegenDoelpunt(verdedigerNaam: string) {
    void voegTegenDoelpuntToe({
      id: crypto.randomUUID(),
      wedstrijdId,
      verdedigerNaam,
      helft: state.huidigeHelft,
      minuut: huidigeMinuut(),
      aangemaaktOp: new Date().toISOString(),
      gewijzigdOp: new Date().toISOString(),
    });
  }

  if (!geladen || !wedstrijd) {
    return <p className="text-sm text-neutral-500">Laden...</p>;
  }

  const stand = berekenStand(state.schotpogingen, state.tegendoelpunten);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-5">
        <div className="text-3xl font-bold text-neutral-900">
          {stand.eigen} - {stand.tegenstander}
        </div>
        <div className="text-sm text-neutral-600">
          Helft {state.huidigeHelft} · minuut {huidigeMinuut()}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={schakelStopwatch}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          {state.helftGestart ? "Pauze" : "Start helft"}
        </button>
        <button
          type="button"
          onClick={wisselHelft}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          Helftwissel
        </button>
        <button
          type="button"
          onClick={() => setToonSchotForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Schotpoging
        </button>
        <button
          type="button"
          onClick={() => setToonTegenForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
        >
          Tegendoelpunt
        </button>
        <a
          href={`/wedstrijd/${wedstrijdId}/log`}
          className="rounded-md border border-neutral-300 px-4 py-2 text-neutral-900 hover:bg-neutral-50"
        >
          Log bekijken
        </a>
        <button
          type="button"
          onClick={() => void rondAf()}
          className="rounded-md bg-danger px-4 py-2 text-white hover:opacity-90"
        >
          Wedstrijd afronden
        </button>
      </div>

      {toonSchotForm && (
        <ShotForm teamNamen={wedstrijd.teamNamen} onSubmit={loggSchotPoging} onClose={() => setToonSchotForm(false)} />
      )}
      {toonTegenForm && <ConcedeForm onSubmit={loggTegenDoelpunt} onClose={() => setToonTegenForm(false)} />}
    </div>
  );
}
