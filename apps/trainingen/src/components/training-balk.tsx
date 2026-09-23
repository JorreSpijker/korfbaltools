"use client";

import Link from "next/link";
import { totaleDuur, useTraining } from "@/lib/use-training";
import { ChevronRight, Clipboard } from "./icons";
import { KOLOM } from "./scherm";

/**
 * De actieve training. Op mobiel een vaste balk onderaan het scherm (de pagina
 * houdt daar ruimte voor vrij met pb-[100px]); vanaf md schuift hij mee in de
 * pagina als een navy blok in de kolom.
 */
export function TrainingBalk() {
  const { geladen, actieveTraining } = useTraining();

  if (!geladen || !actieveTraining || actieveTraining.items.length === 0) return null;

  const aantal = actieveTraining.items.length;

  return (
    <Link
      href={`/mijn-trainingen/bekijk?id=${actieveTraining.id}`}
      className="print-verbergen fixed inset-x-0 bottom-0 z-30 bg-ink pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 text-white md:static md:mt-10 md:bg-transparent md:pb-0 md:pt-0"
    >
      <span className={`${KOLOM} flex items-center gap-3 md:rounded-2xl md:bg-ink md:py-4`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.12]">
          <Clipboard size={20} />
        </span>
        <span className="flex flex-grow flex-col gap-0.5">
          <span className="text-[13px] font-medium text-[#B9C3D3]">Mijn training · {actieveTraining.titel}</span>
          <span className="text-base font-bold">
            {aantal} {aantal === 1 ? "oefening" : "oefeningen"} · {totaleDuur(actieveTraining)} min
          </span>
        </span>
        <ChevronRight size={22} />
      </span>
    </Link>
  );
}
