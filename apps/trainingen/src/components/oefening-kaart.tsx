"use client";

import Link from "next/link";
import { leeftijdKort, variantLabel, type OefeningKaartData } from "@/lib/oefeningen";
import { useTraining } from "@/lib/use-training";
import { Check, Clock, Users } from "./icons";
import { FavorietKnop } from "./favoriet-knop";

function leeftijdTekst(leeftijden: string[]): string {
  return `${leeftijden.map(leeftijdKort).join(", ")} jaar`;
}

export function OefeningKaart({ oefening }: { oefening: OefeningKaartData }) {
  const { geladen, zitInActieve } = useTraining();
  const toegevoegd = geladen && zitInActieve(oefening.slug);

  return (
    <article className="flex flex-col gap-2 rounded-[14px] border border-line bg-white pb-4 pl-4 pr-2 pt-3">
      <div className="flex items-start gap-1">
        <Link
          href={`/oefening/${oefening.slug}`}
          className="min-h-[34px] flex-grow pt-2.5 text-[18px] font-bold leading-[1.3] text-ink"
        >
          {oefening.titel}
        </Link>
        <FavorietKnop slug={oefening.slug} />
      </div>

      <p className="m-0 pr-2 text-[15px] leading-[1.45] text-muted">{oefening.samenvatting}</p>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pr-2 text-sm font-medium text-ink">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={16} className="text-muted" />
          {oefening.duur} min
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={16} className="text-muted" />
          {leeftijdTekst(oefening.leeftijden)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pr-2">
        {oefening.varianten.map((key) => (
          <span key={key} className="rounded-md bg-tint px-2 py-[3px] text-[13px] font-semibold text-ink">
            {variantLabel(key)}
          </span>
        ))}
        <span className="flex-grow" />
        {toegevoegd && (
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-ok">
            <Check size={16} strokeWidth={2.5} />
            In je training
          </span>
        )}
      </div>
    </article>
  );
}
