"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { totaleDuur, useTraining, type Training } from "@/lib/use-training";
import { ChevronRight, Plus, Potlood, Prullenbak, Ster } from "./icons";

function datumTekst(datum: string): string {
  const d = new Date(`${datum}T00:00:00`);
  if (Number.isNaN(d.getTime())) return datum;
  return d.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function samenvatting(training: Training): string {
  const aantal = training.items.length;
  return `${datumTekst(training.datum)} · ${aantal} ${aantal === 1 ? "oefening" : "oefeningen"} · ${totaleDuur(training)} min`;
}

export function TrainingenOverzicht() {
  const router = useRouter();
  const { geladen, trainingen, actieveId, nieuweTraining, zetActief, hernoem, verwijderTraining } = useTraining();
  const [hernoemId, setHernoemId] = useState<string | null>(null);
  const [verwijderId, setVerwijderId] = useState<string | null>(null);

  if (!geladen) return <div className="py-8 text-muted">Laden…</div>;

  return (
    <>
      <button
        type="button"
        onClick={() => router.push(`/mijn-trainingen/bekijk?id=${nieuweTraining()}`)}
        className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline bg-transparent text-base font-bold text-ink md:self-start md:px-6"
      >
        <Plus size={20} />
        Nieuwe training
      </button>

      {trainingen.length === 0 ? (
        <p className="m-0 text-base leading-[1.5] text-muted">
          Je hebt nog geen training. Maak er één aan, of voeg een oefening toe vanuit het overzicht — dan maken we hem
          vanzelf.
        </p>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-4 xl:grid-cols-3">
          {trainingen.map((training) => {
            const actief = training.id === actieveId;
            return (
              <article
                key={training.id}
                className={`flex flex-col gap-2.5 rounded-[14px] bg-white pb-3 pl-4 pr-3 pt-3.5 ${
                  actief ? "border-2 border-ink" : "border border-line"
                }`}
              >
                {hernoemId === training.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setHernoemId(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      autoFocus
                      value={training.titel}
                      onChange={(event) => hernoem(training.id, event.target.value)}
                      aria-label="Naam van de training"
                      className="min-h-11 flex-grow rounded-[10px] border border-outline px-3 text-base font-bold text-ink outline-none"
                    />
                    <button
                      type="submit"
                      className="min-h-11 rounded-[10px] border border-line px-3 text-sm font-bold text-ink"
                    >
                      Klaar
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/mijn-trainingen/bekijk?id=${training.id}`}
                    className="flex min-h-11 items-center gap-3 text-ink"
                  >
                    <span className="flex flex-grow flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[18px] font-extrabold">{training.titel}</span>
                        {actief && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-ink px-2 py-[3px] text-xs font-extrabold tracking-[0.02em] text-white">
                            <Ster size={12} />
                            ACTIEF
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-medium text-muted">{samenvatting(training)}</span>
                    </span>
                    <ChevronRight size={22} />
                  </Link>
                )}

                <div className="flex items-center gap-2 border-t border-tint pt-2.5">
                  {!actief && (
                    <button
                      type="button"
                      onClick={() => zetActief(training.id)}
                      className="min-h-11 rounded-[10px] border border-line bg-white px-3 text-sm font-bold text-ink"
                    >
                      Maak actief
                    </button>
                  )}
                  <span className="flex-grow" />

                  {verwijderId === training.id ? (
                    <>
                      <span className="text-sm font-semibold text-muted">Verwijderen?</span>
                      <button
                        type="button"
                        onClick={() => setVerwijderId(null)}
                        className="min-h-11 rounded-[10px] border border-line bg-white px-3 text-sm font-bold text-ink"
                      >
                        Nee
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          verwijderTraining(training.id);
                          setVerwijderId(null);
                        }}
                        className="min-h-11 rounded-[10px] border border-alert bg-white px-3 text-sm font-bold text-alert"
                      >
                        Ja, verwijder
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-label={`Hernoem ${training.titel}`}
                        onClick={() => setHernoemId(training.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-white text-ink"
                      >
                        <Potlood size={18} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Verwijder ${training.titel}`}
                        onClick={() => setVerwijderId(training.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-white text-alert"
                      >
                        <Prullenbak size={18} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="m-0 mt-1 text-center text-sm text-muted">Trainingen staan alleen in deze browser.</p>
    </>
  );
}
