"use client";

import Link from "next/link";
import { useState } from "react";
import { FOCUS, type FocusKey } from "@/lib/oefeningen";
import { Check, ChevronRight } from "./icons";
import { BalkInhoud } from "./scherm";

export function FocusKiezer({ aantallen }: { aantallen: Record<string, number> }) {
  const [gekozen, setGekozen] = useState<FocusKey[]>([]);

  function toggle(key: FocusKey) {
    setGekozen((vorig) => (vorig.includes(key) ? vorig.filter((k) => k !== key) : [...vorig, key]));
  }

  // De volgorde in de URL volgt FOCUS, niet de klikvolgorde — dan is dezelfde
  // keuze altijd dezelfde link.
  const volgorde = FOCUS.filter((f) => gekozen.includes(f.key)).map((f) => f.key);
  const aantal = volgorde.length;

  return (
    <>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0 md:grid md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        <legend className="sr-only">Focus</legend>
        {FOCUS.map(({ key, label, sub }) => {
          const aan = gekozen.includes(key);
          return (
            <label
              key={key}
              htmlFor={`f-${key}`}
              className={`box-border flex min-h-[68px] cursor-pointer items-center gap-3.5 rounded-[14px] px-4 py-3 ${
                aan ? "border-2 border-ink bg-tint" : "border-2 border-line bg-white"
              }`}
            >
              <input
                id={`f-${key}`}
                type="checkbox"
                checked={aan}
                onChange={() => toggle(key)}
                className="absolute h-px w-px opacity-0"
              />
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] border-2 ${
                  aan ? "border-ink bg-ink text-white" : "border-outline bg-white"
                }`}
              >
                {aan && <Check size={16} strokeWidth={3} />}
              </span>
              <span className="flex flex-grow flex-col gap-0.5">
                <span className="text-[17px] font-bold">{label}</span>
                <span className="text-sm text-muted">{sub}</span>
              </span>
              <span className="whitespace-nowrap text-[13px] font-semibold text-muted">
                {aantallen[key] ?? 0} {aantallen[key] === 1 ? "oefening" : "oefeningen"}
              </span>
            </label>
          );
        })}
      </fieldset>

      <Link
        href="/lijst"
        className="inline-flex min-h-11 items-center self-center text-[15px] font-semibold text-ink underline underline-offset-[3px]"
      >
        Bekijk alle oefeningen
      </Link>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 md:static md:border-0 md:bg-transparent md:pb-0 md:pt-2">
        <BalkInhoud className="md:px-0">
          {aantal === 0 ? (
            <span
              aria-disabled="true"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-line text-[17px] font-bold text-muted md:inline-flex md:px-7"
            >
              Kies minstens één focus
            </span>
          ) : (
            <Link
              href={`/zoek/leeftijd?focus=${volgorde.join(",")}`}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-accent text-[17px] font-bold text-white md:inline-flex md:px-7"
            >
              Verder · {aantal} gekozen
              <ChevronRight size={20} />
            </Link>
          )}
        </BalkInhoud>
      </div>
    </>
  );
}
