import Link from "next/link";
import { notFound } from "next/navigation";
import { ROLES, type Club, type Role, type User } from "@korfbaltools/types";
import { requireClubManager } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { UsersTable } from "@/components/users-table";
import { ClubEditForm } from "@/components/club-edit-form";
import { ClubRequestsTable, type ClubRequest } from "@/components/club-requests-table";
import type { AdminClub } from "@/components/clubs-table";
import { Container } from "@korfbaltools/ui";

interface ClubPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  const { scope } = await requireClubManager();
  const { id } = await params;

  if (scope.type === "club" && scope.clubId !== id) {
    notFound();
  }

  const [clubsResponse, usersResponse, requestsResponse] = await Promise.all([
    fetchMainApi("/api/admin/clubs"),
    fetchMainApi("/api/admin/users"),
    fetchMainApi("/api/admin/club-requests"),
  ]);
  await ensureOk(clubsResponse, "Kan clubs niet laden");
  await ensureOk(usersResponse, "Kan gebruikers niet laden");
  await ensureOk(requestsResponse, "Kan aanmeldingen niet laden");

  const { clubs } = (await clubsResponse.json()) as { clubs: AdminClub[] };
  const { users } = (await usersResponse.json()) as { users: User[] };
  const { requests } = (await requestsResponse.json()) as { requests: ClubRequest[] };

  const club = clubs.find((c) => c.id === id);
  if (!club) {
    notFound();
  }

  const clubUsers = users.filter((user) => user.clubId === id);
  const clubRequests = requests.filter((request) => request.pendingClubId === id);
  const clubsForNameLookup: Pick<Club, "id" | "naam">[] = [{ id: club.id, naam: club.naam }];
  const editableRoles: Role[] = scope.type === "all" ? [...ROLES] : ROLES.filter((role) => role !== "admin");

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{club.naam}</h1>
          <Link className="text-sm text-primary-600 underline" href={scope.type === "all" ? "/clubs" : "/"}>
            {scope.type === "all" ? "Terug naar clubs" : "Terug naar gebruikers"}
          </Link>
        </div>
        <ClubEditForm club={club} scope={scope.type} />
        <ClubRequestsTable requests={clubRequests} />
        <UsersTable
          clubs={clubsForNameLookup}
          users={clubUsers}
          showBeheerderBadge
          editableRoles={editableRoles}
        />
      </Container>
    </main>
  );
}
