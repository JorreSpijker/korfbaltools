export const APP_KEYS = ["teamindeling", "scoreformulier", "vastspelen", "statistieken", "mijn-club"] as const;

export type AppKey = (typeof APP_KEYS)[number];

// Statisch uitgeschreven in plaats van process.env[`APP_${key}_ENABLED`],
// omdat Next.js alleen letterlijke process.env-verwijzingen inlined —
// dynamisch opgezochte sleutels zijn leeg in de middleware (edge runtime).
const ENABLED_BY_KEY: Record<AppKey, string | undefined> = {
  teamindeling: process.env.APP_TEAMINDELING_ENABLED,
  scoreformulier: process.env.APP_SCOREFORMULIER_ENABLED,
  vastspelen: process.env.APP_VASTSPELEN_ENABLED,
  statistieken: process.env.APP_STATISTIEKEN_ENABLED,
  "mijn-club": process.env.APP_MIJN_CLUB_ENABLED,
};

// Alles wat niet letterlijk "true" is telt als uit, zodat een lege of
// ontbrekende variabele nooit per ongeluk een app openzet.
export function isAppEnabled(key: AppKey): boolean {
  return ENABLED_BY_KEY[key] === "true";
}

export interface AppDefinition {
  key: AppKey;
  title: string;
  description: string;
  // null = nog geen deployment om naartoe te routeren; de app kan wel
  // aangezet worden en verschijnt dan op de homepage zonder link.
  href: string | null;
  // Screenshot voor de homepage-kaart, in apps/main/public/images/previews/.
  // null = nog geen screenshot; de kaart toont dan een leeg tint-vlak.
  preview: string | null;
}

// Titel, beschrijving en route staan in code sinds app-beheer niet meer via
// de database (AppConfig) en de admin-app loopt.
const DEFINITIONS: Record<AppKey, Omit<AppDefinition, "key">> = {
  teamindeling: {
    title: "Teamindeling",
    description: "Teamindeling, altijd een gedoe. Dit hulpmiddel maakt het makkelijker.",
    href: "/teamindeling",
    preview: "/images/previews/teamindeling.png",
  },
  scoreformulier: {
    title: "Scoreformulier",
    description: "Houd het scoreverloop van een wedstrijd live bij.",
    href: "/scoreformulier",
    preview: null,
  },
  vastspelen: {
    title: "Vastspelen",
    description: "Bewaak de KNKV-regels rond vastspelen in de A-categorie.",
    href: "/vastspelen",
    preview: null,
  },
  statistieken: {
    title: "Statistieken",
    description: "Wedstrijd- en spelerstatistieken overzichtelijk bijhouden.",
    href: null,
    preview: null,
  },
  "mijn-club": {
    title: "Mijn club",
    description: "Beheer de teams en spelers van je club.",
    href: "/mijn-club",
    preview: null,
  },
};

export function getEnabledApps(): AppDefinition[] {
  return APP_KEYS.filter(isAppEnabled).map((key) => ({ key, ...DEFINITIONS[key] }));
}

export interface NavApp {
  capability: string;
  title: string;
  href: string;
}

// Apps voor de toolbar-nav: ingeschakeld én met een echte route. Wordt ook
// via /api/apps door de losse tool-apps opgehaald, zodat apps/main de enige
// bron van waarheid blijft.
export function getNavApps(): NavApp[] {
  return getEnabledApps().flatMap((app) =>
    app.href ? [{ capability: app.key, title: app.title, href: app.href }] : [],
  );
}

// Padprefix per app, voor de route-check in middleware.ts.
export const APP_KEY_BY_PATH_PREFIX: Array<[string, AppKey]> = APP_KEYS.flatMap((key) => {
  const href = DEFINITIONS[key].href;
  return href ? [[href, key] as [string, AppKey]] : [];
});
