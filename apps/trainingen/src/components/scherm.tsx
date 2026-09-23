// Het design is op 360px getekend. Op desktop groeit de inhoud niet mee tot de
// volle vensterbreedte maar blijft hij binnen dezelfde kolom als de gedeelde
// toolbar en footer. Zelfde breedte als apps/teamindeling: max-w-screen-2xl,
// meegegeven aan KorfbalToolBar en Footer in de layout.
//
// Bewust geen `cn` uit @korfbaltools/ui: die barrel exporteert ook pwa-icon, dat
// next/og importeert. Dit bestand wordt ook door client components gebruikt, en
// dan belandt next/og — en daarmee `fs` — in de clientbundle.
export const KOLOM = "mx-auto w-full max-w-screen-2xl px-5 md:px-6";

interface SchermProps {
  children: React.ReactNode;
  className?: string;
  /** "main" voor de hoofdinhoud van een pagina, "div" voor een deel ervan. */
  as?: "main" | "div";
}

export function Scherm({ children, className, as = "div" }: SchermProps) {
  const Element = as;
  return <Element className={`${KOLOM} ${className ?? ""}`}>{children}</Element>;
}

/**
 * Inhoud van een vaste balk onderaan het scherm. De balk zelf loopt over de
 * volle breedte door (achtergrond en rand), de inhoud blijft in de kolom staan.
 */
export function BalkInhoud({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`${KOLOM} ${className ?? ""}`}>{children}</div>;
}
