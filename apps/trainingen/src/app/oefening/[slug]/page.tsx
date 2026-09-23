import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAlleOefeningen, getOefening } from "@/lib/content";
import { focusLabel, leeftijdKort } from "@/lib/oefeningen";
import { Calendar, Clock, Doos, Target, Users } from "@/components/icons";
import { FavorietKnop } from "@/components/favoriet-knop";
import { Markdown } from "@/components/markdown";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";
import { VariantSectie } from "@/components/variant-sectie";

export function generateStaticParams() {
  return getAlleOefeningen().map((oefening) => ({ slug: oefening.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const oefening = getOefening(slug);
  if (!oefening) return {};
  return { title: oefening.titel, description: oefening.samenvatting };
}

function MetaRegel({
  icon,
  label,
  waarde,
  breed = false,
}: {
  icon: React.ReactNode;
  label: string;
  waarde: string;
  breed?: boolean;
}) {
  return (
    <div className={breed ? "col-span-full md:col-span-1" : undefined}>
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tint text-ink">{icon}</span>
        <span className="flex flex-col gap-px">
          <span className="text-[13px] font-semibold text-muted">{label}</span>
          <span className="text-[15px] font-semibold">{waarde}</span>
        </span>
      </div>
    </div>
  );
}

export default async function OefeningPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const oefening = getOefening(slug);

  if (!oefening) notFound();

  return (
    <Scherm
      as="main"
      className="flex flex-col gap-5 pb-[160px] pt-2 md:grid md:grid-cols-[minmax(0,1fr)_17rem] md:items-start md:gap-x-8 md:gap-y-6 md:pb-16 md:pt-8 xl:grid-cols-[minmax(0,52rem)_19rem] xl:justify-start xl:gap-x-12"
    >
      <div className="flex flex-col gap-2 md:col-span-2">
        <TerugLink href="/lijst">Resultaten</TerugLink>
        <div className="flex items-start gap-2">
          <h1 className="m-0 flex-grow text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] md:text-[38px]">
            {oefening.titel}
          </h1>
          <FavorietKnop slug={oefening.slug} variant="detail" />
        </div>
        <p className="m-0 max-w-prose text-base leading-[1.5] text-muted md:text-lg">{oefening.samenvatting}</p>
      </div>

      {oefening.afbeelding && (
        <Image
          src={oefening.afbeelding}
          alt=""
          width={720}
          height={405}
          sizes="(min-width: 768px) 640px, 100vw"
          className="h-auto w-full rounded-[14px] border border-line bg-white md:col-start-1"
        />
      )}

      <aside className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-[14px] border border-line bg-white p-4 md:col-start-2 md:row-start-2 md:grid-cols-1 md:gap-y-5 md:p-5 lg:sticky lg:top-[76px]">
        <MetaRegel icon={<Clock size={18} />} label="Duur" waarde={`${oefening.duur} min`} />
        <MetaRegel icon={<Users size={18} />} label="Spelers" waarde={oefening.spelers} />
        <MetaRegel
          icon={<Calendar size={18} />}
          label="Leeftijd"
          waarde={oefening.leeftijden.map(leeftijdKort).join(", ")}
        />
        <MetaRegel icon={<Target size={18} />} label="Focus" waarde={oefening.focus.map(focusLabel).join(", ")} />
        {oefening.materiaal.length > 0 && (
          <MetaRegel icon={<Doos size={18} />} label="Materiaal" waarde={oefening.materiaal.join(", ")} breed />
        )}
      </aside>

      <section className="flex flex-col gap-2 md:col-start-1">
        <h2 className="m-0 text-[19px] font-extrabold md:text-[22px]">Opzet</h2>
        <Markdown>{oefening.gedeeld}</Markdown>
      </section>

      <Suspense fallback={<div className="text-muted md:col-start-1">Laden…</div>}>
        <VariantSectie oefening={oefening} />
      </Suspense>
    </Scherm>
  );
}
