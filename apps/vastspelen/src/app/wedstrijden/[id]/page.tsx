import { Container } from "@korfbaltools/ui";
import type { VastspelenAppearance, VastspelenFixture, VastspelenPlayer } from "@korfbaltools/types";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { AppearancesForm } from "@/components/appearances-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WedstrijdDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [fixtureResponse, stateResponse, appearancesResponse] = await Promise.all([
    fetchMainApi(`/api/vastspelen/fixtures/${id}`),
    fetchMainApi("/api/vastspelen/state"),
    fetchMainApi(`/api/vastspelen/fixtures/${id}/appearances`),
  ]);
  await ensureOk(fixtureResponse, "Kan wedstrijd niet laden");
  await ensureOk(stateResponse, "Kan spelers niet laden");
  await ensureOk(appearancesResponse, "Kan minuten niet laden");

  const { fixture } = (await fixtureResponse.json()) as { fixture: VastspelenFixture };
  const { players } = (await stateResponse.json()) as { players: VastspelenPlayer[] };
  const { appearances } = (await appearancesResponse.json()) as { appearances: VastspelenAppearance[] };

  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">
            {fixture.teamNiveau === 1 ? "1e team" : "2e team"} vs. {fixture.tegenstander}
          </h1>
          <p className="text-neutral-600">
            Speelweek {fixture.speelweek} — {new Date(fixture.datum).toLocaleDateString("nl-NL")} — wedstrijdduur{" "}
            {fixture.wedstrijdduur} minuten.
          </p>
        </div>
        <AppearancesForm fixture={fixture} players={players} initialAppearances={appearances} />
      </Container>
    </main>
  );
}
