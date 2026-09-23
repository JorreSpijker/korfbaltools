import { Scherm } from "@/components/scherm";
import { StartKaarten } from "@/components/start-kaarten";

export default function StartPagina() {
  return (
    <Scherm className="flex flex-col gap-6 pb-6 pt-7 md:gap-10 md:pb-16 md:pt-14" as="main">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold uppercase tracking-[0.04em] text-accent">Trainingen</span>
        <h1 className="m-0 text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em] md:text-[40px]">
          Stel je training samen
        </h1>
        <p className="m-0 max-w-prose text-base leading-[1.5] text-muted md:text-lg">
          Zoek oefeningen op wat je wilt trainen en zet ze in een training die je kunt printen.
        </p>
      </div>

      <StartKaarten />
    </Scherm>
  );
}
