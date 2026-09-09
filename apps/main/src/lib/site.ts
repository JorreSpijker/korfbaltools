// Canonieke basis-URL voor metadata, sitemap en robots. In productie zet
// APP_URL het echte domein; de fallback voorkomt relatieve og:url's als de
// variabele bij een preview-build ontbreekt. Bewust zonder NEXT_PUBLIC_-prefix:
// de waarde wordt alleen server-side gelezen en is zo runtime aanpasbaar.
export const SITE_URL = process.env.APP_URL ?? "https://www.korfbaltools.nl";

export const SITE_NAME = "Korfbaltools.nl";

export const SITE_DESCRIPTION =
  "Gratis tools voor korfbalclubs: teamindeling maken, het scoreverloop van een wedstrijd bijhouden en de " +
  "KNKV-regels rond vastspelen bewaken. Zonder account, zonder installatie.";
