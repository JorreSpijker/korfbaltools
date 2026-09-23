"use client";

import Link from "next/link";
import type { OefeningKaartData } from "@/lib/oefeningen";
import { useTraining } from "@/lib/use-training";
import { Heart, Search } from "./icons";
import { OefeningKaart } from "./oefening-kaart";

export function FavorietenLijst({ kaarten }: { kaarten: OefeningKaartData[] }) {
  const { geladen, favorieten } = useTraining();

  if (!geladen) return <div className="py-8 text-muted">Laden…</div>;

  const gekozen = kaarten.filter((kaart) => favorieten.includes(kaart.slug));

  if (gekozen.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dash bg-white px-6 py-8 text-center md:mx-auto md:max-w-lg md:py-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Heart size={30} />
        </span>
        <h2 className="m-0 text-xl font-extrabold">Nog geen favorieten</h2>
        <p className="m-0 text-base leading-[1.5] text-muted">
          Tik op het hartje bij een oefening. Hij staat daarna hier, en je kunt in de lijst filteren op alleen
          favorieten.
        </p>
        <Link
          href="/zoek"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-base font-bold text-white"
        >
          <Search size={18} />
          Zoek oefeningen
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:items-start md:gap-4 xl:grid-cols-3">
      {gekozen.map((kaart) => (
        <OefeningKaart key={kaart.slug} oefening={kaart} />
      ))}
    </div>
  );
}
