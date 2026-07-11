import Link from "next/link";
import { notFound } from "next/navigation";
import type { Club, User } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { UsersTable } from "@/components/users-table";
import { ClubEditForm } from "@/components/club-edit-form";
import type { AdminClub } from "@/components/clubs-table";
import { Container } from "@korfbaltools/ui";

interface ClubPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [clubsResponse, usersResponse] = await Promise.all([
    fetchMainApi("/api/admin/clubs"),
    fetchMainApi("/api/admin/users"),
  ]);
  await ensureOk(clubsResponse, "Kan clubs niet laden");
  await ensureOk(usersResponse, "Kan gebruikers niet laden");

  const { clubs } = (await clubsResponse.json()) as { clubs: AdminClub[] };
  const { users } = (await usersResponse.json()) as { users: User[] };

  const club = clubs.find((c) => c.id === id);
  if (!club) {
    notFound();
  }

  const clubUsers = users.filter((user) => user.clubId === id);
  const clubsForNameLookup: Pick<Club, "id" | "naam">[] = [{ id: club.id, naam: club.naam }];

  return (
    <main className="py-10">
      <Container>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{club.naam}</h1>
          <Link className="text-sm text-primary-600 underline" href="/clubs">
            Terug naar clubs
          </Link>
        </div>
        <ClubEditForm club={club} />
        <UsersTable clubs={clubsForNameLookup} users={clubUsers} showBeheerderBadge />
      </Container>
    </main>
  );
}
