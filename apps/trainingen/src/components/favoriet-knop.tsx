"use client";

import { useTraining } from "@/lib/use-training";
import { Heart } from "./icons";

interface Props {
  slug: string;
  /** "kaart" = plat knopje in de lijst, "detail" = ronde knop naast de titel. */
  variant?: "kaart" | "detail";
}

export function FavorietKnop({ slug, variant = "kaart" }: Props) {
  const { geladen, isFavoriet, toggleFavoriet } = useTraining();
  const actief = geladen && isFavoriet(slug);

  const basis =
    variant === "detail"
      ? "h-12 w-12 shrink-0 rounded-full border border-line bg-white"
      : "h-11 w-11 shrink-0 border-0 bg-transparent";

  return (
    <button
      type="button"
      onClick={() => toggleFavoriet(slug)}
      aria-pressed={actief}
      aria-label={actief ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
      className={`flex items-center justify-center p-0 ${basis} ${actief ? "text-accent" : "text-muted"}`}
    >
      <Heart size={variant === "detail" ? 24 : 22} gevuld={actief} />
    </button>
  );
}
