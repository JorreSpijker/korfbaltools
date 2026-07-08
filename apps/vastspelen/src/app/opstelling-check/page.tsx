import { Container } from "@korfbaltools/ui";
import type { VastspelenFixture, VastspelenPlayer } from "@korfbaltools/types";
import { requireTeamleider } from "@/lib/require-teamleider";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { OpstellingCheckForm } from "@/components/opstelling-check-form";

export default async function OpstellingCheckPage() {
  await requireTeamleider();

  const [fixturesResponse, stateResponse] = await Promise.all([
    fetchMainApi("/api/vastspelen/fixtures"),
    fetchMainApi("/api/vastspelen/state"),
  ]);
  await ensureOk(fixturesResponse, "Kan wedstrijden niet laden");
  await ensureOk(stateResponse, "Kan spelers niet laden");

  const { fixtures } = (await fixturesResponse.json()) as { fixtures: VastspelenFixture[] };
  const { players } = (await stateResponse.json()) as { players: VastspelenPlayer[] };
  const aankomendeFixtures = fixtures.filter((fixture) => !fixture.gespeeld);

  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Opstelling checken</h1>
          <p className="text-neutral-600">
            Vink de spelers aan die je wilt opstellen (incl. eventuele invaller uit het andere team) en check vóór de
            wedstrijd of dit is toegestaan.
          </p>
        </div>
        {aankomendeFixtures.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Geen aankomende wedstrijden zonder ingevoerde minuten — maak eerst een wedstrijd aan.
          </p>
        ) : (
          <OpstellingCheckForm fixtures={aankomendeFixtures} players={players} />
        )}
      </Container>
    </main>
  );
}
