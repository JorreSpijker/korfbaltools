"use client";

import Link from "next/link";
import { totaleDuur, useTraining } from "@/lib/use-training";
import { ChevronRight, Clipboard, Heart, Search } from "./icons";

export function StartKaarten() {
  const { geladen, actieveTraining, trainingen, favorieten } = useTraining();

  const aantal = actieveTraining?.items.length ?? 0;
  const onderschrift = !geladen
    ? " "
    : aantal > 0 && actieveTraining
      ? `${actieveTraining.titel} · ${aantal} ${aantal === 1 ? "oefening" : "oefeningen"} · ${totaleDuur(actieveTraining)} min`
      : trainingen.length > 0
        ? `${trainingen.length} bewaard`
        : "Nog geen training bewaard";

  return (
    <>
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-5">
        <Link
          href="/zoek"
          className="box-border flex min-h-[104px] items-center gap-4 rounded-2xl border-2 border-accent bg-accent p-[18px] text-white"
        >
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-white/[0.16]">
            <Search size={26} />
          </span>
          <span className="flex flex-grow flex-col gap-1">
            <span className="text-xl font-extrabold">Zoek oefeningen</span>
            <span className="text-sm font-medium text-accent-light">Op focus en leeftijd</span>
          </span>
          <ChevronRight size={22} />
        </Link>

        <Link
          href="/mijn-trainingen"
          className="box-border flex min-h-[104px] items-center gap-4 rounded-2xl border-2 border-ink bg-white p-[18px] text-ink"
        >
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-tint">
            <Clipboard size={26} />
          </span>
          <span className="flex flex-grow flex-col gap-1">
            <span className="text-xl font-extrabold">Mijn trainingen</span>
            <span className="text-sm font-medium text-muted">{onderschrift}</span>
          </span>
          <ChevronRight size={22} />
        </Link>
      </div>

      <Link
        href="/favorieten"
        className="inline-flex min-h-11 items-center gap-2 self-center text-[15px] font-semibold text-ink underline underline-offset-[3px]"
      >
        <Heart size={18} className="text-accent" />
        Mijn favorieten
        {geladen && favorieten.length > 0 ? ` (${favorieten.length})` : ""}
      </Link>
    </>
  );
}
