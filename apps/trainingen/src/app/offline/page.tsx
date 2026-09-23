import type { Metadata } from "next";
import Link from "next/link";
import { Clipboard, GeenVerbinding } from "@/components/icons";
import { Scherm } from "@/components/scherm";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePagina() {
  return (
    <Scherm className="flex flex-1 flex-col items-center gap-3.5 pb-6 pt-16 text-center" as="main">
      <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-tint text-ink">
        <GeenVerbinding size={34} />
      </span>
      <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em]">Je bent offline</h1>
      <p className="m-0 text-base leading-[1.5] text-muted">
        Deze pagina staat nog niet op dit toestel. Je bewaarde trainingen werken wel, ook zonder netwerk.
      </p>
      <Link
        href="/mijn-trainingen"
        className="mt-2 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-accent px-6 text-[17px] font-bold text-white"
      >
        <Clipboard size={20} />
        Naar mijn trainingen
      </Link>
    </Scherm>
  );
}
