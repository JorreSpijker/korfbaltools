import { aantalPerFocus } from "@/lib/content";
import { FocusKiezer } from "@/components/focus-kiezer";
import { Scherm } from "@/components/scherm";
import { TerugLink } from "@/components/terug-link";

export default function ZoekPagina() {
  const aantallen = aantalPerFocus();

  return (
    <Scherm className="flex flex-col gap-4 pb-6 pt-2 md:gap-6 md:pb-16 md:pt-8" as="main">
      <div className="flex flex-col gap-1.5">
        <TerugLink href="/">Start</TerugLink>
        <span className="text-sm font-bold text-accent">Stap 1 van 2</span>
        <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em] md:text-[34px]">Wat wil je trainen?</h1>
        <p className="m-0 text-base text-muted">Kies één categorie.</p>
      </div>

      <FocusKiezer aantallen={aantallen} />
    </Scherm>
  );
}
