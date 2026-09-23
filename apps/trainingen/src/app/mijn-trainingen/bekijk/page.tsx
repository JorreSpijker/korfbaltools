import type { Metadata } from "next";
import { Suspense } from "react";
import { TrainingBewerker } from "@/components/training-bewerker";

export const metadata: Metadata = {
  title: "Training",
};

// Bewust geen [id]-route: één statische pagina die de id uit de query leest is
// met één cache-entry altijd offline beschikbaar, ook voor een training die na
// het laatste bezoek is aangemaakt (zie docs/apps/trainingen-plan.md §8).
export default function BekijkPagina() {
  return (
    <Suspense fallback={<div className="px-5 py-8 text-muted">Laden…</div>}>
      <TrainingBewerker />
    </Suspense>
  );
}
