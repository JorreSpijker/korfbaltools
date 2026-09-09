// Canonieke basis-URL voor metadata, sitemap en robots. In productie zet
// NEXT_PUBLIC_APP_URL het echte domein; de fallback voorkomt relatieve
// og:url's als de variabele bij een preview-build ontbreekt.
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

export const SITE_NAME = "Korfbaltools.nl";

export const SITE_DESCRIPTION =
  "Gratis tools voor korfbalclubs: teamindeling maken, het scoreverloop van een wedstrijd bijhouden en de " +
  "KNKV-regels rond vastspelen bewaken. Zonder account, zonder installatie.";
