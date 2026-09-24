"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  beschikbareVarianten,
  isVariantKey,
  kiesVariant,
  variantLabel,
  type Oefening,
  type VariantKey,
} from "@/lib/oefeningen";
import { totaleDuur, useTraining } from "@/lib/use-training";
import { Check, ChevronRight, Clipboard, Prullenbak } from "./icons";
import { Markdown } from "./markdown";
import { BalkInhoud } from "./scherm";

export function VariantSectie({ oefening }: { oefening: Oefening }) {
  const router = useRouter();
  const params = useSearchParams();
  const { geladen, variantVoorkeur, zetVariantVoorkeur, voegToe, verwijderItem, zitInActieve, actieveTraining } = useTraining();

  const uitUrl = params.get("variant");
  const gevraagd: VariantKey = isVariantKey(uitUrl ?? undefined)
    ? (uitUrl as VariantKey)
    : geladen
      ? variantVoorkeur
      : "basis";
  const variant = kiesVariant(oefening, gevraagd);
  const opties = beschikbareVarianten(oefening);
  const toegevoegd = geladen && zitInActieve(oefening.slug);
  const aantal = actieveTraining?.items.length ?? 0;

  function kies(key: VariantKey) {
    zetVariantVoorkeur(key);
    const zoek = new URLSearchParams(params.toString());
    zoek.set("variant", key);
    router.replace(`/oefening/${oefening.slug}?${zoek.toString()}`, {
      scroll: false,
    });
  }

  return (
    <div className="flex flex-col gap-5 md:col-start-1">
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[19px] font-extrabold md:text-[22px]">Uitvoering</h2>

        <div role="group" aria-label="Uitvoering" className="flex gap-1 rounded-xl bg-tint p-1">
          {opties.map((key) => {
            const aan = key === variant;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={aan}
                onClick={() => kies(key)}
                className={`min-h-11 flex-1 basis-0 rounded-lg border-0 text-[15px] font-bold ${
                  aan ? "bg-ink text-white" : "bg-transparent text-ink"
                }`}
              >
                {variantLabel(key)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 rounded-[14px] border border-line bg-white p-4">
          <Markdown>{oefening.varianten[variant] ?? ""}</Markdown>
        </div>
      </section>

      <div className="print-verbergen fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:static md:border-0 md:bg-transparent md:pb-0 md:pt-0">
        <BalkInhoud className="flex flex-col gap-1 md:px-0">
          {geladen && actieveTraining && aantal > 0 && (
            <Link
              href={`/mijn-trainingen/bekijk?id=${actieveTraining.id}`}
              className="flex min-h-11 items-center gap-2 text-sm text-ink"
            >
              <Clipboard size={18} className="text-muted" />
              <span className="flex-grow">
                <strong>{actieveTraining.titel}</strong> · {aantal} {aantal === 1 ? "oefening" : "oefeningen"} ·{" "}
                {totaleDuur(actieveTraining)} min
              </span>
              <ChevronRight size={18} className="text-muted" />
            </Link>
          )}

          <div className="flex gap-2 md:self-start">
            <button
              type="button"
              disabled={toegevoegd}
              onClick={() => voegToe(oefening, variant)}
              className={`flex min-h-[52px] flex-grow items-center justify-center gap-2 rounded-xl border-2 text-[17px] font-bold md:px-7 ${
                toegevoegd ? "border-ok bg-white text-ok" : "border-accent bg-accent text-white"
              }`}
            >
              {toegevoegd && <Check size={20} strokeWidth={2.5} />}
              {toegevoegd ? "Toegevoegd aan training" : "Toevoegen aan training"}
            </button>
            {toegevoegd && actieveTraining && (
              <button
                type="button"
                onClick={() => verwijderItem(actieveTraining.id, oefening.slug)}
                className="inline-flex min-h-[52px] items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-[15px] font-bold text-alert"
              >
                <Prullenbak size={18} />
                Verwijder
              </button>
            )}
          </div>
        </BalkInhoud>
      </div>
    </div>
  );
}
