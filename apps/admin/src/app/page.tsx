import { Users } from "lucide-react";
import type { Club, User } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { AdminPageHeader } from "@/components/admin-page-header";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { UsersTable } from "@/components/users-table";
import { Container } from "@korfbaltools/ui";

export default async function AdminUsersPage() {
  await requireAdmin();

  const [usersResponse, clubsResponse] = await Promise.all([
    fetchMainApi("/api/admin/users"),
    fetchMainApi("/api/clubs"),
  ]);
  await ensureOk(usersResponse, "Kan gebruikers niet laden");
  await ensureOk(clubsResponse, "Kan clubs niet laden");
  const { users } = (await usersResponse.json()) as { users: User[] };
  const { clubs } = (await clubsResponse.json()) as { clubs: Pick<Club, "id" | "naam">[] };

  return (
    <main className="py-10">
      <Container>
        <AdminPageHeader
          icon={Users}
          title="Gebruikersbeheer"
          description="Rollen, capabilities en clubkoppeling per gebruiker beheren."
        />
        <div className="flex justify-end">
          <CreateUserDialog clubs={clubs} />
        </div>
        <UsersTable clubs={clubs} users={users} />
      </Container>
    </main>
  );
}
