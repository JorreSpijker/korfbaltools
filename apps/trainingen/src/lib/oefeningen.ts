// Gedeelde woordenlijst van de app: gebruikt door de contentlaag (server) en
// door de trainings-state (client). Geen fs of server-only hier, zodat client
// components deze constanten gewoon kunnen importeren.

export const FOCUS = [
  { key: "aanvallen", label: "Aanvallen", sub: "Vrijlopen, afvangen, kansen maken" },
  { key: "verdedigen", label: "Verdedigen", sub: "Dekken, voorverdedigen, onderscheppen" },
  { key: "gooien-vangen", label: "Gooien en vangen", sub: "Passen onder druk, balbehandeling" },
  { key: "schottechniek", label: "Schottechniek", sub: "Afstandsschot, doorloopbal, strafworp" },
  { key: "rebounden", label: "Rebounden", sub: "Positie kiezen, bal veroveren" },
  { key: "spelsituaties", label: "Spelsituaties", sub: "Twee-tegen-een, omschakelen, vakwissel" },
] as const;

export type FocusKey = (typeof FOCUS)[number]["key"];

export const LEEFTIJDEN = [
  { key: "4-7", label: "4 – 7 jaar", kort: "4–7", sub: "Spelenderwijs, korte opdrachten" },
  { key: "8-12", label: "8 – 12 jaar", kort: "8–12", sub: "Techniek aanleren en herhalen" },
  { key: "13-18", label: "13 – 18 jaar", kort: "13–18", sub: "Tempo, weerstand, spelsituaties" },
] as const;

export type LeeftijdKey = (typeof LEEFTIJDEN)[number]["key"];

export const VARIANTEN = [
  { key: "simpel", label: "Simpel" },
  { key: "basis", label: "Basis" },
  { key: "uitgebreid", label: "Uitgebreid" },
] as const;

export type VariantKey = (typeof VARIANTEN)[number]["key"];

export function focusLabel(key: string): string {
  return FOCUS.find((f) => f.key === key)?.label ?? key;
}

export function leeftijdLabel(key: string): string {
  return LEEFTIJDEN.find((l) => l.key === key)?.label ?? key;
}

/** "8–12" — voor chips, kaartmeta en de segmented control. */
export function leeftijdKort(key: string): string {
  return LEEFTIJDEN.find((l) => l.key === key)?.kort ?? key;
}

export function variantLabel(key: string): string {
  return VARIANTEN.find((v) => v.key === key)?.label ?? key;
}

export function isVariantKey(value: string | undefined): value is VariantKey {
  return VARIANTEN.some((v) => v.key === value);
}

export interface Oefening {
  slug: string;
  titel: string;
  samenvatting: string;
  leeftijden: LeeftijdKey[];
  focus: FocusKey[];
  duur: number;
  spelers: string;
  materiaal: string[];
  afbeelding?: string;
  /** Markdown boven de eerste variantkop — geldt voor elke variant. */
  gedeeld: string;
  varianten: Partial<Record<VariantKey, string>>;
}

/** De varianten die deze oefening daadwerkelijk heeft, in vaste volgorde. */
export function beschikbareVarianten(oefening: Pick<Oefening, "varianten">): VariantKey[] {
  return VARIANTEN.filter((v) => oefening.varianten[v.key]).map((v) => v.key);
}

/**
 * Wat een kaart in het overzicht nodig heeft. Bewust zonder de tekst van de
 * oefening: de lijst filtert client-side (o.a. op favorieten), en dan hoeft de
 * volledige markdown niet mee over de draad.
 */
export interface OefeningKaartData {
  slug: string;
  titel: string;
  samenvatting: string;
  leeftijden: LeeftijdKey[];
  focus: FocusKey[];
  duur: number;
  varianten: VariantKey[];
  /** titel + samenvatting + opzet, lowercase — voor de zoekterm. */
  zoektekst: string;
}

export interface Filters {
  focus?: string[];
  leeftijd?: string;
  duurMax?: number;
  q?: string;
  alleenFavorieten?: boolean;
}

export function filterKaarten(
  kaarten: OefeningKaartData[],
  { focus, leeftijd, duurMax, q, alleenFavorieten }: Filters,
  favorieten: string[] = [],
): OefeningKaartData[] {
  const zoekterm = q?.trim().toLowerCase();

  return kaarten.filter((kaart) => {
    if (focus && focus.length > 0 && !focus.some((key) => kaart.focus.includes(key as FocusKey))) return false;
    if (leeftijd && !kaart.leeftijden.includes(leeftijd as LeeftijdKey)) return false;
    if (duurMax !== undefined && kaart.duur > duurMax) return false;
    if (alleenFavorieten && !favorieten.includes(kaart.slug)) return false;
    if (zoekterm && !kaart.zoektekst.includes(zoekterm)) return false;
    return true;
  });
}

/** De gevraagde variant, of de dichtstbijzijnde die wel bestaat. */
export function kiesVariant(oefening: Pick<Oefening, "varianten">, gewenst: VariantKey): VariantKey {
  const beschikbaar = beschikbareVarianten(oefening);
  if (beschikbaar.includes(gewenst)) return gewenst;
  return beschikbaar.includes("basis") ? "basis" : (beschikbaar[0] ?? "basis");
}
