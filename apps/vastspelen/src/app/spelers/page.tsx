import { Container } from "@korfbaltools/ui";
import type { VastspelenPlayer } from "@korfbaltools/types";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { SpelersManager } from "@/components/spelers-manager";

export default async function SpelersPage() {
  const response = await fetchMainApi("/api/vastspelen/state");
  await ensureOk(response, "Kan spelers niet laden");
  const { players } = (await response.json()) as { players: VastspelenPlayer[] };

  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Spelers beheren</h1>
          <p className="text-neutral-600">
            Spelerslijst is gedeeld tussen de teamleiders van het 1e en 2e team, zodat invalbeurten correct geteld
            worden.
          </p>
        </div>
        <SpelersManager initialPlayers={players} />
      </Container>
    </main>
  );
}
