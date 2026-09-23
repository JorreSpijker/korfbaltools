"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  FOCUS,
  LEEFTIJDEN,
  filterKaarten,
  leeftijdKort,
  type FocusKey,
  type OefeningKaartData,
} from "@/lib/oefeningen";
import { useTraining } from "@/lib/use-training";
import { Check, Heart, Kruis, Search, Sliders } from "./icons";
import { BalkInhoud, Scherm } from "./scherm";
import { OefeningKaart } from "./oefening-kaart";

const DUUR_OPTIES = [10, 15, 20];

function chipKlassen(aan: boolean): string {
  return `inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[22px] px-4 text-[15px] font-semibold ${
    aan ? "border border-ink bg-ink text-white" : "border border-line bg-white text-ink"
  }`;
}

function segmentKlassen(aan: boolean): string {
  return `min-h-11 flex-1 basis-0 rounded-lg border-0 text-[15px] font-bold ${
    aan ? "bg-ink text-white" : "bg-transparent text-ink"
  }`;
}

export function LijstScherm({ kaarten }: { kaarten: OefeningKaartData[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { geladen, favorieten } = useTraining();

  const focus = (params.get("focus")?.split(",").filter(Boolean) ?? []) as FocusKey[];
  const leeftijd = params.get("leeftijd") ?? undefined;
  const duurParam = params.get("duur");
  const duurMax = duurParam ? Number(duurParam) : undefined;
  const q = params.get("q") ?? undefined;
  const alleenFavorieten = params.get("fav") === "1";

  const [sheetOpen, setSheetOpen] = useState(false);
  const [conceptLeeftijd, setConceptLeeftijd] = useState<string | undefined>(leeftijd);
  const [conceptDuur, setConceptDuur] = useState<number | undefined>(duurMax);
  const [conceptQ, setConceptQ] = useState(q ?? "");

  function navigeer(next: Record<string, string | undefined>) {
    const zoek = new URLSearchParams(params.toString());
    for (const [sleutel, waarde] of Object.entries(next)) {
      if (waarde === undefined || waarde === "") zoek.delete(sleutel);
      else zoek.set(sleutel, waarde);
    }
    const query = zoek.toString();
    router.replace(query ? `/lijst?${query}` : "/lijst", { scroll: false });
  }

  function toggleFocus(key: FocusKey) {
    const next = focus.includes(key) ? focus.filter((f) => f !== key) : [...focus, key];
    const volgorde = FOCUS.filter((f) => next.includes(f.key)).map((f) => f.key);
    navigeer({ focus: volgorde.join(",") });
  }

  function openSheet() {
    setConceptLeeftijd(leeftijd);
    setConceptDuur(duurMax);
    setConceptQ(q ?? "");
    setSheetOpen(true);
  }

  function pasToe() {
    navigeer({
      leeftijd: conceptLeeftijd,
      duur: conceptDuur ? String(conceptDuur) : undefined,
      q: conceptQ.trim() || undefined,
    });
    setSheetOpen(false);
  }

  const filters = { focus, leeftijd, duurMax, q, alleenFavorieten };
  const resultaten = filterKaarten(kaarten, filters, geladen ? favorieten : []);
  const conceptAantal = filterKaarten(
    kaarten,
    {
      focus,
      leeftijd: conceptLeeftijd,
      duurMax: conceptDuur,
      q: conceptQ,
      alleenFavorieten,
    },
    geladen ? favorieten : [],
  ).length;

  const extraFilters = [leeftijd, duurMax, q].filter(Boolean).length;
  const gekozenFocus = FOCUS.filter((f) => focus.includes(f.key));
  const overigeFocus = FOCUS.filter((f) => !focus.includes(f.key));

  return (
    <>
      <div className="sticky top-[60px] z-20 border-b border-line bg-page py-3">
        <BalkInhoud className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-muted">
              <strong className="text-ink">
                {resultaten.length} {resultaten.length === 1 ? "oefening" : "oefeningen"}
              </strong>
              {leeftijd ? ` · ${leeftijdKort(leeftijd)} jaar` : ""}
            </span>
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-[15px] font-semibold text-ink"
            >
              <Sliders size={18} />
              Meer filters
              {extraFilters > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[10px] bg-ink text-xs font-bold text-white">
                  {extraFilters}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {gekozenFocus.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed
                onClick={() => toggleFocus(key)}
                className={chipKlassen(true)}
              >
                <Check size={16} strokeWidth={2.5} />
                {label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={alleenFavorieten}
              onClick={() => navigeer({ fav: alleenFavorieten ? undefined : "1" })}
              className={chipKlassen(alleenFavorieten)}
            >
              <Heart size={16} gevuld={alleenFavorieten} className={alleenFavorieten ? "" : "text-muted"} />
              Alleen favorieten
            </button>
            {overigeFocus.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={false}
                onClick={() => toggleFocus(key)}
                className={chipKlassen(false)}
              >
                {label}
              </button>
            ))}
          </div>
        </BalkInhoud>
      </div>

      <Scherm className="flex flex-col gap-3 pb-[100px] pt-4 md:grid md:grid-cols-2 md:items-start md:gap-4 md:pb-16 md:pt-6 xl:grid-cols-3">
        {resultaten.map((kaart) => (
          <OefeningKaart key={kaart.slug} oefening={kaart} />
        ))}

        {resultaten.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dash bg-white px-6 py-8 text-center md:col-span-2 xl:col-span-3">
            <h2 className="m-0 text-xl font-extrabold">Niets gevonden</h2>
            <p className="m-0 text-base leading-[1.5] text-muted">
              Zet de filters ruimer: kies meer focussen, of haal de leeftijd of maximale duur weg.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/lijst", { scroll: false })}
              className="mt-2 inline-flex min-h-12 items-center rounded-xl bg-accent px-5 text-base font-bold text-white"
            >
              Alle filters wissen
            </button>
          </div>
        )}
      </Scherm>

      {sheetOpen && (
        <div className="print-verbergen fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Sluiten"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 w-full cursor-default bg-ink/55"
          />
          <section
            aria-label="Meer filters"
            className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-4xl flex-col gap-5 rounded-t-[20px] bg-white px-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-2 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:p-6 md:shadow-xl"
            onKeyDown={(event) => {
              if (event.key === "Escape") setSheetOpen(false);
            }}
          >
            <span className="h-[5px] w-10 self-center rounded-[3px] bg-line md:hidden" />

            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[22px] font-extrabold">Meer filters</h2>
              <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setSheetOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-tint text-ink"
              >
                <Kruis size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[15px] font-bold">Leeftijd</span>
              <div className="flex gap-1 rounded-xl bg-tint p-1">
                {LEEFTIJDEN.map(({ key, kort }) => {
                  const aan = conceptLeeftijd === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={aan}
                      onClick={() => setConceptLeeftijd(aan ? undefined : key)}
                      className={segmentKlassen(aan)}
                    >
                      {kort}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[15px] font-bold">Maximale duur</span>
              <div className="flex gap-1 rounded-xl bg-tint p-1">
                <button
                  type="button"
                  aria-pressed={conceptDuur === undefined}
                  onClick={() => setConceptDuur(undefined)}
                  className={segmentKlassen(conceptDuur === undefined)}
                >
                  Alles
                </button>
                {DUUR_OPTIES.map((minuten) => (
                  <button
                    key={minuten}
                    type="button"
                    aria-pressed={conceptDuur === minuten}
                    onClick={() => setConceptDuur(minuten)}
                    className={segmentKlassen(conceptDuur === minuten)}
                  >
                    {minuten} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="q" className="text-[15px] font-bold">
                Zoekterm
              </label>
              <div className="flex min-h-12 items-center gap-2 rounded-[10px] border border-outline bg-white px-3">
                <Search size={20} className="text-muted" />
                <input
                  id="q"
                  type="search"
                  value={conceptQ}
                  onChange={(event) => setConceptQ(event.target.value)}
                  placeholder="bijv. doorloopbal"
                  className="min-h-11 flex-grow border-0 bg-transparent text-base text-ink outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setConceptLeeftijd(undefined);
                  setConceptDuur(undefined);
                  setConceptQ("");
                }}
                className="min-h-[52px] border-0 bg-transparent px-4 text-base font-bold text-ink underline underline-offset-[3px]"
              >
                Wis filters
              </button>
              <button
                type="button"
                onClick={pasToe}
                className="flex min-h-[52px] flex-grow items-center justify-center rounded-xl bg-accent text-[17px] font-bold text-white"
              >
                Toon {conceptAantal} {conceptAantal === 1 ? "oefening" : "oefeningen"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
