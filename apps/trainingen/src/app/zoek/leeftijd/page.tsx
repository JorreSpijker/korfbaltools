import Link from "next/link";
import { redirect } from "next/navigation";
import { zoekOefeningen } from "@/lib/content";
import { FOCUS, LEEFTIJDEN, focusLabel, type FocusKey } from "@/lib/oefeningen";
import { ChevronRight } from "@/components/icons";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";

const geldigeFocus = new Set<string>(FOCUS.map((f) => f.key));

export default async function LeeftijdPagina({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus } = await searchParams;
  const gekozen = (focus?.split(",") ?? []).filter((key) => geldigeFocus.has(key)) as FocusKey[];

  if (gekozen.length === 0) redirect("/zoek");

  return (
    <Scherm className="flex flex-col gap-4 pb-6 pt-2 md:gap-6 md:pb-16 md:pt-8" as="main">
      <div className="flex flex-col gap-1.5">
        <TerugLink href="/zoek">Stap 1</TerugLink>
        <span className="text-sm font-bold text-accent">Stap 2 van 2</span>
        <h1 className="m-0 text-[26px] font-extrabold leading-[1.2] tracking-[-0.02em] md:text-[34px]">
          Voor welke leeftijds&shy;categorie?
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm text-muted">Je koos:</span>
        {gekozen.map((key) => (
          <span key={key} className="rounded-md bg-tint px-2 py-[3px] text-[13px] font-semibold text-ink">
            {focusLabel(key)}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
        {LEEFTIJDEN.map(({ key, label, sub }) => {
          const aantal = zoekOefeningen({
            focus: gekozen,
            leeftijd: key,
          }).length;
          return (
            <Link
              key={key}
              href={`/lijst?focus=${gekozen.join(",")}&leeftijd=${key}`}
              className="box-border flex min-h-[88px] items-center gap-4 rounded-2xl border-2 border-line bg-white px-[18px] py-4 text-ink md:min-h-[168px] md:flex-col md:items-start md:justify-between md:gap-3 md:p-5"
            >
              <span className="flex flex-grow flex-col gap-1">
                <span className="text-2xl font-extrabold tracking-[-0.01em]">{label}</span>
                <span className="text-sm font-medium text-muted">{sub}</span>
              </span>
              <span className="whitespace-nowrap rounded-lg bg-tint px-2.5 py-1 text-sm font-bold text-ink">
                {aantal} {aantal === 1 ? "oefening" : "oefeningen"}
              </span>
              <ChevronRight size={22} className="md:hidden" />
            </Link>
          );
        })}
      </div>
    </Scherm>
  );
}
