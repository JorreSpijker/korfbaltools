"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { kiesVariant, type Oefening, type VariantKey } from "./oefeningen";

const OPSLAG_KEY = "korfbaltools:trainingen:v1";

export interface TrainingItem {
  slug: string;
  titel: string;
  focus: string[];
  /** Markdown die voor elke variant geldt. */
  gedeeld: string;
  varianten: Partial<Record<VariantKey, string>>;
  /** De variant die nu getoond en geprint wordt. */
  variant: VariantKey;
  duurMinuten: number;
  notitie: string;
}

export interface Training {
  id: string;
  titel: string;
  datum: string;
  items: TrainingItem[];
}

interface Opslag {
  versie: 1;
  actieveId: string | null;
  trainingen: Training[];
  favorieten: string[];
  variantVoorkeur: VariantKey;
}

const LEEG: Opslag = {
  versie: 1,
  actieveId: null,
  trainingen: [],
  favorieten: [],
  variantVoorkeur: "basis",
};

function lees(): Opslag {
  try {
    const ruw = window.localStorage.getItem(OPSLAG_KEY);
    if (!ruw) return LEEG;
    const data = JSON.parse(ruw) as Partial<Opslag>;
    if (data.versie !== 1) return LEEG;
    return {
      versie: 1,
      actieveId: data.actieveId ?? null,
      trainingen: data.trainingen ?? [],
      favorieten: data.favorieten ?? [],
      variantVoorkeur: data.variantVoorkeur ?? "basis",
    };
  } catch {
    return LEEG;
  }
}

function nieuweId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `t${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function datumTitel(datum: Date): string {
  return `Training ${datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`;
}

function maakTraining(): Training {
  const nu = new Date();
  return {
    id: nieuweId(),
    titel: datumTitel(nu),
    datum: nu.toISOString().slice(0, 10),
    items: [],
  };
}

export function totaleDuur(training: Training | undefined): number {
  return training?.items.reduce((som, item) => som + item.duurMinuten, 0) ?? 0;
}

interface TrainingContextWaarde {
  /** false tot localStorage gelezen is; tot die tijd niets tonen dat verschilt per browser. */
  geladen: boolean;
  trainingen: Training[];
  actieveId: string | null;
  actieveTraining: Training | undefined;
  favorieten: string[];
  variantVoorkeur: VariantKey;
  isFavoriet: (slug: string) => boolean;
  zitInActieve: (slug: string) => boolean;
  getTraining: (id: string | null) => Training | undefined;
  voegToe: (oefening: Oefening, variant: VariantKey) => void;
  verwijderItem: (trainingId: string, slug: string) => void;
  verplaats: (trainingId: string, slug: string, richting: -1 | 1) => void;
  zetDuur: (trainingId: string, slug: string, minuten: number) => void;
  zetNotitie: (trainingId: string, slug: string, notitie: string) => void;
  zetItemVariant: (trainingId: string, slug: string, variant: VariantKey) => void;
  nieuweTraining: () => string;
  zetActief: (id: string) => void;
  hernoem: (id: string, titel: string) => void;
  zetDatum: (id: string, datum: string) => void;
  verwijderTraining: (id: string) => void;
  toggleFavoriet: (slug: string) => void;
  zetVariantVoorkeur: (variant: VariantKey) => void;
}

const TrainingContext = createContext<TrainingContextWaarde | null>(null);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [opslag, setOpslag] = useState<Opslag>(LEEG);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    setOpslag(lees());
    setGeladen(true);
  }, []);

  useEffect(() => {
    if (!geladen) return;
    try {
      window.localStorage.setItem(OPSLAG_KEY, JSON.stringify(opslag));
    } catch {
      // Opslag vol of geblokkeerd: de sessie werkt door, alleen niet bewaard.
    }
  }, [opslag, geladen]);

  const wijzigItems = useCallback((trainingId: string, fn: (items: TrainingItem[]) => TrainingItem[]) => {
    setOpslag((vorig) => ({
      ...vorig,
      trainingen: vorig.trainingen.map((training) =>
        training.id === trainingId ? { ...training, items: fn(training.items) } : training,
      ),
    }));
  }, []);

  const waarde = useMemo<TrainingContextWaarde>(() => {
    const actieveTraining = opslag.trainingen.find((t) => t.id === opslag.actieveId);

    return {
      geladen,
      trainingen: opslag.trainingen,
      actieveId: opslag.actieveId,
      actieveTraining,
      favorieten: opslag.favorieten,
      variantVoorkeur: opslag.variantVoorkeur,

      isFavoriet: (slug) => opslag.favorieten.includes(slug),
      zitInActieve: (slug) => actieveTraining?.items.some((item) => item.slug === slug) ?? false,
      getTraining: (id) => opslag.trainingen.find((t) => t.id === id),

      voegToe: (oefening, variant) => {
        const item: TrainingItem = {
          slug: oefening.slug,
          titel: oefening.titel,
          focus: [...oefening.focus],
          gedeeld: oefening.gedeeld,
          varianten: oefening.varianten,
          variant: kiesVariant(oefening, variant),
          duurMinuten: oefening.duur,
          notitie: "",
        };

        setOpslag((vorig) => {
          // Zonder actieve training maken we er stil één aan, zodat toevoegen
          // altijd één tik blijft (zie docs/apps/trainingen-plan.md §9).
          const bestaat = vorig.trainingen.some((t) => t.id === vorig.actieveId);
          const doel = bestaat ? vorig.trainingen.find((t) => t.id === vorig.actieveId)! : maakTraining();
          const trainingen = bestaat ? vorig.trainingen : [doel, ...vorig.trainingen];

          return {
            ...vorig,
            actieveId: doel.id,
            trainingen: trainingen.map((training) =>
              training.id === doel.id && !training.items.some((i) => i.slug === item.slug)
                ? { ...training, items: [...training.items, item] }
                : training,
            ),
          };
        });
      },

      verwijderItem: (trainingId, slug) => {
        wijzigItems(trainingId, (items) => items.filter((item) => item.slug !== slug));
      },

      verplaats: (trainingId, slug, richting) => {
        wijzigItems(trainingId, (items) => {
          const index = items.findIndex((item) => item.slug === slug);
          const doel = index + richting;
          if (index === -1 || doel < 0 || doel >= items.length) return items;
          const kopie = [...items];
          const [verplaatst] = kopie.splice(index, 1);
          if (verplaatst) kopie.splice(doel, 0, verplaatst);
          return kopie;
        });
      },

      zetDuur: (trainingId, slug, minuten) => {
        wijzigItems(trainingId, (items) =>
          items.map((item) => (item.slug === slug ? { ...item, duurMinuten: Math.max(1, minuten) } : item)),
        );
      },

      zetNotitie: (trainingId, slug, notitie) => {
        wijzigItems(trainingId, (items) => items.map((item) => (item.slug === slug ? { ...item, notitie } : item)));
      },

      zetItemVariant: (trainingId, slug, variant) => {
        wijzigItems(trainingId, (items) =>
          items.map((item) => (item.slug === slug ? { ...item, variant: kiesVariant(item, variant) } : item)),
        );
      },

      nieuweTraining: () => {
        const training = maakTraining();
        setOpslag((vorig) => ({
          ...vorig,
          actieveId: training.id,
          trainingen: [training, ...vorig.trainingen],
        }));
        return training.id;
      },

      zetActief: (id) => setOpslag((vorig) => ({ ...vorig, actieveId: id })),

      hernoem: (id, titel) => {
        setOpslag((vorig) => ({
          ...vorig,
          trainingen: vorig.trainingen.map((t) => (t.id === id ? { ...t, titel } : t)),
        }));
      },

      zetDatum: (id, datum) => {
        setOpslag((vorig) => ({
          ...vorig,
          trainingen: vorig.trainingen.map((t) => (t.id === id ? { ...t, datum } : t)),
        }));
      },

      verwijderTraining: (id) => {
        setOpslag((vorig) => {
          const trainingen = vorig.trainingen.filter((t) => t.id !== id);
          return {
            ...vorig,
            trainingen,
            actieveId: vorig.actieveId === id ? (trainingen[0]?.id ?? null) : vorig.actieveId,
          };
        });
      },

      toggleFavoriet: (slug) => {
        setOpslag((vorig) => ({
          ...vorig,
          favorieten: vorig.favorieten.includes(slug)
            ? vorig.favorieten.filter((f) => f !== slug)
            : [...vorig.favorieten, slug],
        }));
      },

      zetVariantVoorkeur: (variant) => setOpslag((vorig) => ({ ...vorig, variantVoorkeur: variant })),
    };
  }, [opslag, geladen, wijzigItems]);

  return <TrainingContext.Provider value={waarde}>{children}</TrainingContext.Provider>;
}

export function useTraining(): TrainingContextWaarde {
  const context = useContext(TrainingContext);
  if (!context) throw new Error("useTraining moet binnen TrainingProvider staan");
  return context;
}
