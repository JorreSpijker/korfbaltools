import { Suspense } from "react";
import { getKaarten } from "@/lib/content";
import { LijstScherm } from "@/components/lijst-scherm";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";
import { TrainingBalk } from "@/components/training-balk";

export default function LijstPagina() {
  const kaarten = getKaarten();

  return (
    // Geen Scherm om de hele main: de filterbalk plakt over de volle breedte,
    // alleen zijn inhoud staat in de kolom.
    <main className="flex flex-col">
      <Scherm className="flex flex-col gap-1.5 pt-2">
        <TerugLink href="/zoek">Zoeken</TerugLink>
        <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em]">Oefeningen</h1>
      </Scherm>

      <Suspense fallback={<Scherm className="py-8 text-muted">Laden…</Scherm>}>
        <LijstScherm kaarten={kaarten} />
      </Suspense>

      <TrainingBalk />
    </main>
  );
}
