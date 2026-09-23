import type { Metadata } from "next";
import { getKaarten } from "@/lib/content";
import { FavorietenLijst } from "@/components/favorieten-lijst";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";
import { TrainingBalk } from "@/components/training-balk";

export const metadata: Metadata = {
  title: "Favorieten",
};

export default function FavorietenPagina() {
  return (
    <>
      <Scherm as="main" className="flex flex-col gap-4 pb-[100px] pt-2 md:gap-6 md:pb-10 md:pt-8">
        <TerugLink href="/">Start</TerugLink>
        <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em] md:text-[34px]">Favorieten</h1>

        <FavorietenLijst kaarten={getKaarten()} />
      </Scherm>

      <TrainingBalk />
    </>
  );
}
