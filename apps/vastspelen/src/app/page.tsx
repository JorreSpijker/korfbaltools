import Link from "next/link";
import { ClipboardCheck, ListChecks, Users } from "lucide-react";
import { Container } from "@korfbaltools/ui";
import type { VastspelenPlayer, VastspelenSeasonPeriod, VastspelenTeam } from "@korfbaltools/types";
import { requireTeamleider } from "@/lib/require-teamleider";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { StatusBadge } from "@/components/status-badge";

interface VastspelenState {
  teams: VastspelenTeam[];
  players: VastspelenPlayer[];
  seasonPeriod: VastspelenSeasonPeriod | null;
  seasonPeriods: VastspelenSeasonPeriod[];
}

export default async function DashboardPage() {
  await requireTeamleider();

  const response = await fetchMainApi("/api/vastspelen/state");
  await ensureOk(response, "Kan spelersstatus niet laden");
  const state = (await response.json()) as VastspelenState;

  const spelersPerTeam = (niveau: 1 | 2) => state.players.filter((player) => player.teamNiveau === niveau);

  return (
    <main className="py-10">
      <Container>
        <div className="flex w-full flex-col gap-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Vastspelen</h1>
          <p className="text-neutral-600">
            Overzicht van invalbeurten en eigen-team-status voor het 1e en 2e team (A-categorie).
          </p>
        </div>

        {!state.seasonPeriod && (
          <div className="w-full rounded-lg border border-dashed border-neutral-200 bg-paper p-5 text-sm text-neutral-600">
            Nog geen seizoensperiode ingesteld — statussen kunnen pas berekend worden nadat er een periode (veld/zaal,
            met totaal aantal wedstrijden) is aangemaakt via de wedstrijden-pagina.
          </div>
        )}

        <div className="flex w-full flex-wrap gap-3">
          <Link
            href="/wedstrijden"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
          >
            <ListChecks className="h-4 w-4" /> Wedstrijden &amp; minuten
          </Link>
          <Link
            href="/opstelling-check"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600"
          >
            <ClipboardCheck className="h-4 w-4" /> Opstelling checken
          </Link>
          <Link
            href="/spelers"
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2 text-neutral-900 hover:bg-paper"
          >
            <Users className="h-4 w-4" /> Spelers beheren
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {([1, 2] as const).map((niveau) => (
            <div key={niveau} className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-5">
              <h2 className="text-lg font-semibold text-neutral-900">{niveau === 1 ? "1e team" : "2e team"}</h2>
              {spelersPerTeam(niveau).length === 0 ? (
                <p className="text-sm text-neutral-500">Nog geen spelers toegevoegd.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {spelersPerTeam(niveau).map((player) => (
                    <li key={player.id} className="flex items-center justify-between py-2">
                      <span className="text-neutral-900">{player.naam}</span>
                      <StatusBadge status={player.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
