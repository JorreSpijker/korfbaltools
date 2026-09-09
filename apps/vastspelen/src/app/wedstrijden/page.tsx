import { Container } from "@korfbaltools/ui";
import type { VastspelenFixture, VastspelenSeasonPeriod } from "@korfbaltools/types";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { WedstrijdenManager } from "@/components/wedstrijden-manager";

export default async function WedstrijdenPage() {
  const [stateResponse, fixturesResponse] = await Promise.all([
    fetchMainApi("/api/vastspelen/state"),
    fetchMainApi("/api/vastspelen/fixtures"),
  ]);
  await ensureOk(stateResponse, "Kan seizoensperiodes niet laden");
  await ensureOk(fixturesResponse, "Kan wedstrijden niet laden");

  const { seasonPeriods } = (await stateResponse.json()) as { seasonPeriods: VastspelenSeasonPeriod[] };
  const { fixtures } = (await fixturesResponse.json()) as { fixtures: VastspelenFixture[] };

  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Wedstrijden &amp; minuten</h1>
          <p className="text-neutral-600">
            Wedstrijden worden hier handmatig aangemaakt — er is nog geen automatische koppeling met de
            programma-API. Vul na afloop de gespeelde minuten per speler in.
          </p>
        </div>
        <WedstrijdenManager initialFixtures={fixtures} initialSeasonPeriods={seasonPeriods} />
      </Container>
    </main>
  );
}
