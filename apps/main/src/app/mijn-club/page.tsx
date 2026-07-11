import { redirect } from "next/navigation";
import { prisma } from "@korfbaltools/db";
import { getSessionUser } from "@/lib/session";
import { toPublicUser } from "@/lib/user-mapper";
import { Badge } from "@/components/ui/badge";
import { MembersTable } from "./members-table";
import { ClubRequestsTable, type ClubJoinRequest } from "./club-requests-table";
import { TeamsBoard } from "./teams-board";

export default async function MijnClubPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.isClubBeheerder || !user.clubId) redirect("/");

  const club = await prisma.club.findUnique({ where: { id: user.clubId } });
  if (!club) redirect("/");

  const memberRecords = await prisma.user.findMany({
    where: { clubId: user.clubId },
    orderBy: { createdAt: "desc" },
  });
  const members = memberRecords.map(toPublicUser);

  const requests: ClubJoinRequest[] = await prisma.user.findMany({
    where: { pendingClubId: user.clubId },
    select: { id: true, email: true, naam: true },
    orderBy: { createdAt: "desc" },
  });

  const teams = await prisma.team.findMany({
    where: { clubId: user.clubId },
    orderBy: { naam: "asc" },
  });
  const players = await prisma.player.findMany({
    where: { clubId: user.clubId },
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
      <ClubRequestsTable requests={requests} />
      <MembersTable members={members} />
      <TeamsBoard teams={teams} players={players} />
    </main>
  );
}
