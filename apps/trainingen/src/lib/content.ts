import "server-only";

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  FOCUS,
  LEEFTIJDEN,
  beschikbareVarianten,
  type FocusKey,
  type LeeftijdKey,
  type Oefening,
  type OefeningKaartData,
  type VariantKey,
} from "./oefeningen";

const focusKeys = FOCUS.map((f) => f.key) as [FocusKey, ...FocusKey[]];
const leeftijdKeys = LEEFTIJDEN.map((l) => l.key) as [LeeftijdKey, ...LeeftijdKey[]];

const frontmatterSchema = z.object({
  titel: z.string().min(1),
  samenvatting: z.string().min(1),
  leeftijden: z.array(z.enum(leeftijdKeys)).min(1),
  focus: z.array(z.enum(focusKeys)).min(1),
  duur: z.number().int().positive(),
  spelers: z.string().min(1),
  materiaal: z.array(z.string()).default([]),
  afbeelding: z.string().optional(),
});

// De koppen waarop de body in varianten uiteenvalt. "## Basis" is verplicht,
// de andere twee mogen ontbreken; de toggle toont alleen wat bestaat.
const VARIANT_HEADING = /^##[ \t]+(Simpel|Basis|Uitgebreid)[ \t]*$/gim;

export function splitVarianten(body: string, bestand: string) {
  const koppen = [...body.matchAll(VARIANT_HEADING)];
  const eerste = koppen[0];

  if (eerste?.index === undefined) {
    throw new Error(`${bestand}: geen variantkoppen gevonden; "## Basis" is verplicht`);
  }

  const gedeeld = body.slice(0, eerste.index).trim();
  const varianten: Partial<Record<VariantKey, string>> = {};

  koppen.forEach((kop, i) => {
    const start = (kop.index ?? 0) + kop[0].length;
    const einde = koppen[i + 1]?.index ?? body.length;
    const key = (kop[1] ?? "").toLowerCase() as VariantKey;
    varianten[key] = body.slice(start, einde).trim();
  });

  if (!varianten.basis) {
    throw new Error(`${bestand}: "## Basis" ontbreekt of is leeg`);
  }

  return { gedeeld, varianten };
}

const CONTENT_DIR = path.join(process.cwd(), "content", "oefeningen");

function leesOefeningen(): Oefening[] {
  const bestanden = readdirSync(CONTENT_DIR).filter((naam) => naam.endsWith(".md") && naam !== "README.md");

  const oefeningen = bestanden.map((bestand) => {
    const ruw = readFileSync(path.join(CONTENT_DIR, bestand), "utf-8");
    const { data, content } = matter(ruw);
    const parsed = frontmatterSchema.safeParse(data);

    if (!parsed.success) {
      const problemen = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join(", ");
      throw new Error(`${bestand}: ongeldige frontmatter — ${problemen}`);
    }

    const { gedeeld, varianten } = splitVarianten(content, bestand);

    return {
      slug: bestand.replace(/\.md$/, ""),
      ...parsed.data,
      gedeeld,
      varianten,
    } satisfies Oefening;
  });

  return oefeningen.sort((a, b) => a.titel.localeCompare(b.titel, "nl"));
}

// Eenmalig bij de eerste import; de content verandert alleen bij een deploy.
const OEFENINGEN = leesOefeningen();

export function getAlleOefeningen(): Oefening[] {
  return OEFENINGEN;
}

export function getOefening(slug: string): Oefening | undefined {
  return OEFENINGEN.find((oefening) => oefening.slug === slug);
}

export interface ZoekFilters {
  focus?: string[];
  leeftijd?: string;
  duurMax?: number;
  q?: string;
}

export function zoekOefeningen({ focus, leeftijd, duurMax, q }: ZoekFilters = {}): Oefening[] {
  const zoekterm = q?.trim().toLowerCase();

  return OEFENINGEN.filter((oefening) => {
    if (focus && focus.length > 0 && !focus.some((key) => oefening.focus.includes(key as FocusKey))) return false;
    if (leeftijd && !oefening.leeftijden.includes(leeftijd as LeeftijdKey)) return false;
    if (duurMax !== undefined && oefening.duur > duurMax) return false;
    if (zoekterm) {
      const hooiberg = `${oefening.titel} ${oefening.samenvatting} ${oefening.gedeeld}`.toLowerCase();
      if (!hooiberg.includes(zoekterm)) return false;
    }
    return true;
  });
}

/** Alles wat de lijst- en favorietenschermen nodig hebben, zonder de markdown. */
export function getKaarten(): OefeningKaartData[] {
  return OEFENINGEN.map((oefening) => ({
    slug: oefening.slug,
    titel: oefening.titel,
    samenvatting: oefening.samenvatting,
    leeftijden: oefening.leeftijden,
    focus: oefening.focus,
    duur: oefening.duur,
    varianten: beschikbareVarianten(oefening),
    zoektekst: `${oefening.titel} ${oefening.samenvatting} ${oefening.gedeeld}`.toLowerCase(),
  }));
}

/** Aantal oefeningen per focus, voor de tellers in stap 1 van de wizard. */
export function aantalPerFocus(leeftijd?: string): Record<string, number> {
  const telling: Record<string, number> = {};
  for (const { key } of FOCUS) {
    telling[key] = zoekOefeningen({ focus: [key], leeftijd }).length;
  }
  return telling;
}
