import Link from "next/link";
import { FOCUS } from "@/lib/oefeningen";
import { ChevronRight } from "./icons";

export function FocusKiezer({ aantallen }: { aantallen: Record<string, number> }) {
  return (
    <>
      <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {FOCUS.map(({ key, label, sub }) => (
          <Link
            key={key}
            href={`/zoek/leeftijd?focus=${key}`}
            className="box-border flex min-h-[68px] items-center gap-3.5 rounded-[14px] border-2 border-line bg-white px-4 py-3 text-ink"
          >
            <span className="flex flex-grow flex-col gap-0.5">
              <span className="text-[17px] font-bold">{label}</span>
              <span className="text-sm text-muted">{sub}</span>
            </span>
            <span className="whitespace-nowrap text-[13px] font-semibold text-muted">
              {aantallen[key] ?? 0} {aantallen[key] === 1 ? "oefening" : "oefeningen"}
            </span>
            <ChevronRight size={20} />
          </Link>
        ))}
      </div>

      <Link
        href="/lijst"
        className="inline-flex min-h-11 items-center self-center text-[15px] font-semibold text-ink underline underline-offset-[3px]"
      >
        Bekijk alle oefeningen
      </Link>
    </>
  );
}
