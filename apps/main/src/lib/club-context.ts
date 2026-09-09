import "server-only";
import { errorResponse } from "./api-response";
import { isAppEnabled, type AppKey } from "./apps";

type GuardedClub = { clubId: string } | { response: ReturnType<typeof errorResponse> };

// Vastspelen- en mijn-club-data zijn club-gescoped (zie packages/db
// schema.prisma). Sinds accounts weg zijn komt die club niet meer uit de
// ingelogde gebruiker, maar uit DEFAULT_CLUB_ID — zie plan.md. De app-toggle
// wordt hier ook gecheckt, omdat de middleware alleen paginaroutes ziet en
// niet /api/*.
export function requireClub(app: AppKey): GuardedClub {
  if (!isAppEnabled(app)) {
    return { response: errorResponse("not_found", "Deze app staat uit") };
  }

  const clubId = process.env.DEFAULT_CLUB_ID;
  if (!clubId) {
    return { response: errorResponse("forbidden", "Geen club ingesteld (DEFAULT_CLUB_ID)") };
  }

  return { clubId };
}
