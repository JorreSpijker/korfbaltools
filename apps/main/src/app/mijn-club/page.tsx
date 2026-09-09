import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@korfbaltools/db";
import { isAppEnabled } from "@/lib/apps";
import { Badge } from "@/components/ui/badge";
import { TeamsBoard } from "./teams-board";

export const metadata: Metadata = {
  title: "Mijn club",
  robots: { index: false, follow: false },
};

export default async function MijnClubPage() {
  if (!isAppEnabled("mijn-club")) notFound();

  const clubId = process.env.DEFAULT_CLUB_ID;
  const club = clubId ? await prisma.club.findUnique({ where: { id: clubId } }) : null;
  if (!club) notFound();

  const teams = await prisma.team.findMany({
    where: { clubId: club.id },
    orderBy: { naam: "asc" },
  });
  const players = await prisma.player.findMany({
    where: { clubId: club.id },
    orderBy: { naam: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-neutral-900">{club.naam}</h1>
        <div>
          <Badge variant={club.active ? "success" : "neutral"}>{club.active ? "Actief" : "Niet actief"}</Badge>
        </div>
      </div>
      <TeamsBoard teams={teams} players={players} />
    </main>
  );
}
