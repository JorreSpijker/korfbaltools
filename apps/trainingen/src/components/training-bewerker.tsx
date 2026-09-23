"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { variantLabel, type VariantKey } from "@/lib/oefeningen";
import { totaleDuur, useTraining, type TrainingItem } from "@/lib/use-training";
import { Calendar, ChevronDown, ChevronUp, Clock, Min, Plus, Printer, Prullenbak } from "./icons";
import { Markdown } from "./markdown";
import { BalkInhoud, Scherm } from "./scherm";
import { TerugLink } from "./terug-link";

const VARIANT_VOLGORDE: VariantKey[] = ["simpel", "basis", "uitgebreid"];

function tijdvak(start: number, duur: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(start)}–${pad(start + duur)}′`;
}

function langeDatum(datum: string): string {
  const d = new Date(`${datum}T00:00:00`);
  if (Number.isNaN(d.getTime())) return datum;
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function TrainingBewerker() {
  const params = useSearchParams();
  const id = params.get("id");
  const {
    geladen,
    getTraining,
    actieveId,
    hernoem,
    zetDatum,
    zetDuur,
    zetNotitie,
    zetItemVariant,
    verplaats,
    verwijderItem,
  } = useTraining();

  if (!geladen) return <div className="px-5 py-8 text-muted">Laden…</div>;

  const training = getTraining(id ?? actieveId);

  if (!training) {
    return (
      <Scherm as="main" className="flex flex-col gap-4 pb-6 pt-2">
        <TerugLink href="/mijn-trainingen">Mijn trainingen</TerugLink>
        <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em]">Training niet gevonden</h1>
        <p className="m-0 text-base leading-[1.5] text-muted">
          Deze training bestaat niet (meer) in deze browser. Trainingen worden lokaal bewaard, dus op een ander toestel
          staan ze er niet.
        </p>
        <Link
          href="/mijn-trainingen"
          className="inline-flex min-h-12 items-center self-start rounded-xl bg-accent px-5 text-base font-bold text-white"
        >
          Naar mijn trainingen
        </Link>
      </Scherm>
    );
  }

  const totaal = totaleDuur(training);
  const aantal = training.items.length;

  let loper = 0;
  const metTijd = training.items.map((item) => {
    const start = loper;
    loper += item.duurMinuten;
    return { item, start };
  });

  return (
    <>
      <Scherm as="main" className="print-verbergen flex flex-col gap-4 pb-[120px] pt-2 md:gap-6 md:pb-10 md:pt-8">
        <TerugLink href="/mijn-trainingen">Mijn trainingen</TerugLink>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="titel" className="text-[13px] font-bold text-muted">
            Naam
          </label>
          <input
            id="titel"
            type="text"
            value={training.titel}
            onChange={(event) => hernoem(training.id, event.target.value)}
            className="-mt-2 min-h-11 border-0 border-b-2 border-line bg-transparent py-1 text-2xl font-extrabold tracking-[-0.01em] text-ink outline-none md:max-w-lg md:text-[32px]"
          />
          <div className="flex items-center gap-2.5">
            <label htmlFor="datum" className="sr-only">
              Datum
            </label>
            <div className="flex min-h-11 items-center gap-2 rounded-[10px] border border-line bg-white px-3">
              <Calendar size={18} className="text-muted" />
              <input
                id="datum"
                type="date"
                value={training.datum}
                onChange={(event) => zetDatum(training.id, event.target.value)}
                className="border-0 bg-transparent text-base text-ink outline-none"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[15px] font-bold">
              <Clock size={18} className="text-muted" />
              {aantal} {aantal === 1 ? "oefening" : "oefeningen"} · {totaal} min
            </span>
          </div>
        </div>

        <ol className="m-0 flex list-none flex-col gap-3.5 p-0 md:gap-5">
          {training.items.map((item, index) => (
            <li key={item.slug} className="flex flex-col gap-3.5 rounded-[14px] border border-line bg-white p-4 md:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-extrabold text-white">
                  {index + 1}
                </span>
                <span className="flex flex-grow flex-col gap-0.5">
                  <Link href={`/oefening/${item.slug}`} className="text-[18px] font-extrabold leading-[1.25] text-ink">
                    {item.titel}
                  </Link>
                  <span className="text-sm text-muted">{item.focus.join(", ")}</span>
                </span>
              </div>

              <VariantKeuze item={item} onKies={(key) => zetItemVariant(training.id, item.slug, key)} />

              <div className="flex flex-col gap-1.5">
                <div className="text-[15px] leading-[1.5] text-muted">
                  <Markdown klein>{item.gedeeld}</Markdown>
                </div>
                <div className="text-[15px] leading-[1.5]">
                  <Markdown klein>{item.varianten[item.variant] ?? ""}</Markdown>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 md:flex-row-reverse md:items-start md:gap-6">
                <div className="flex items-center gap-3 md:shrink-0 md:flex-col md:items-start md:gap-1.5">
                  <label htmlFor={`duur-${item.slug}`} className="flex-grow text-[15px] font-bold md:flex-none">
                    Duur
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-line">
                    <button
                      type="button"
                      aria-label="5 minuten korter"
                      onClick={() => zetDuur(training.id, item.slug, item.duurMinuten - 5)}
                      className="flex h-11 w-11 items-center justify-center border-0 bg-tint p-0 text-ink"
                    >
                      <Min size={20} />
                    </button>
                    <input
                      id={`duur-${item.slug}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={5}
                      value={item.duurMinuten}
                      onChange={(event) => zetDuur(training.id, item.slug, Number(event.target.value))}
                      className="h-11 w-[52px] border-0 bg-white text-center text-base font-bold text-ink outline-none"
                    />
                    <button
                      type="button"
                      aria-label="5 minuten langer"
                      onClick={() => zetDuur(training.id, item.slug, item.duurMinuten + 5)}
                      className="flex h-11 w-11 items-center justify-center border-0 bg-tint p-0 text-ink"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <span className="text-[15px] text-muted md:hidden">min</span>
                </div>

                <div className="flex flex-col gap-1.5 md:flex-1">
                  <label htmlFor={`note-${item.slug}`} className="text-[15px] font-bold">
                    Notitie
                  </label>
                  <textarea
                    id={`note-${item.slug}`}
                    rows={2}
                    value={item.notitie}
                    onChange={(event) => zetNotitie(training.id, item.slug, event.target.value)}
                    placeholder="Voor jezelf, komt mee op de print"
                    className="min-h-16 w-full resize-y rounded-[10px] border border-outline px-3 py-2.5 text-base leading-[1.4] text-ink"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Zet ${item.titel} eerder`}
                  disabled={index === 0}
                  onClick={() => verplaats(training.id, item.slug, -1)}
                  className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-white p-0 text-ink disabled:opacity-35"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  type="button"
                  aria-label={`Zet ${item.titel} later`}
                  disabled={index === training.items.length - 1}
                  onClick={() => verplaats(training.id, item.slug, 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-white p-0 text-ink disabled:opacity-35"
                >
                  <ChevronDown size={20} />
                </button>
                <span className="flex-grow" />
                <button
                  type="button"
                  onClick={() => verwijderItem(training.id, item.slug)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-line bg-white px-3 text-sm font-bold text-alert"
                >
                  <Prullenbak size={18} />
                  Verwijder
                </button>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/zoek"
          className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline text-base font-bold text-ink"
        >
          <Plus size={20} />
          Oefening toevoegen
        </Link>
      </Scherm>

      {aantal > 0 && (
        <div className="print-verbergen fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:pb-16 md:pt-0">
          <BalkInhoud>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-accent text-[17px] font-bold text-white md:w-auto md:px-7"
            >
              <Printer size={20} />
              Printen of bewaren als pdf
            </button>
          </BalkInhoud>
        </div>
      )}

      {/* Het A4-blad. Alleen zichtbaar tijdens printen; zie globals.css. */}
      <div className="print-blad hidden bg-white text-ink print:block">
        <div className="flex items-end justify-between gap-6 pb-3">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[34px] font-extrabold tracking-[-0.02em]">{training.titel}</h1>
            <span className="text-base text-[#3A4352]">
              {langeDatum(training.datum)} · {aantal} {aantal === 1 ? "oefening" : "oefeningen"} · {totaal} minuten
            </span>
          </div>
        </div>

        {metTijd.map(({ item, start }, index) => (
          <section
            key={item.slug}
            className="print-sectie grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-t border-[#C9CFD8] py-[18px]"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-[28px] font-extrabold leading-none">{index + 1}</span>
              <span className="text-[13px] text-[#3A4352]">{tijdvak(start, item.duurMinuten)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <h2 className="m-0 flex-grow text-xl font-extrabold">{item.titel}</h2>
                <span className="text-[15px] font-bold">{item.duurMinuten} min</span>
                <span className="rounded border border-ink px-1.5 py-px text-[13px] font-bold">
                  {variantLabel(item.variant)}
                </span>
              </div>
              <Markdown>{item.gedeeld}</Markdown>
              <div>
                <span className="font-bold">{variantLabel(item.variant)}: </span>
                <Markdown>{item.varianten[item.variant] ?? ""}</Markdown>
              </div>
              {item.notitie.trim() !== "" && (
                <div className="rounded-md border border-[#9AA3B2] px-3 py-2 text-[15px]">
                  <strong>Notitie:</strong> {item.notitie}
                </div>
              )}
            </div>
          </section>
        ))}

        <div className="flex justify-between border-t border-[#C9CFD8] pt-2.5 text-[13px] text-[#3A4352]">
          <span>korfbaltools.nl/trainingen</span>
        </div>
      </div>
    </>
  );
}

function VariantKeuze({ item, onKies }: { item: TrainingItem; onKies: (key: VariantKey) => void }) {
  const opties = VARIANT_VOLGORDE.filter((key) => item.varianten[key]);
  if (opties.length < 2) return null;

  return (
    <div role="group" aria-label="Uitvoering" className="flex gap-1 rounded-xl bg-tint p-1">
      {opties.map((key) => {
        const aan = key === item.variant;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={aan}
            onClick={() => onKies(key)}
            className={`min-h-11 flex-1 basis-0 rounded-lg border-0 text-[15px] font-bold ${
              aan ? "bg-ink text-white" : "bg-transparent text-ink"
            }`}
          >
            {variantLabel(key)}
          </button>
        );
      })}
    </div>
  );
}
