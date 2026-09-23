import type { Metadata } from "next";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";
import { TrainingenOverzicht } from "@/components/trainingen-overzicht";

export const metadata: Metadata = {
  title: "Mijn trainingen",
};

export default function MijnTrainingenPagina() {
  return (
    <Scherm className="flex flex-col gap-4 pb-6 pt-2 md:gap-6 md:pb-16 md:pt-8" as="main">
      <TerugLink href="/">Start</TerugLink>
      <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em] md:text-[34px]">Mijn trainingen</h1>

      <TrainingenOverzicht />
    </Scherm>
  );
}
