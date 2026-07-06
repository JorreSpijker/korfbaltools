import type { Club, User } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { fetchMainApi } from "@/lib/main-api";
import { AdminNav } from "../../../../packages/ui/src/admin-nav";
import { UsersTable } from "@/components/users-table";

export default async function AdminUsersPage() {
  await requireAdmin();

  const [usersResponse, clubsResponse] = await Promise.all([
    fetchMainApi("/api/admin/users"),
    fetchMainApi("/api/clubs"),
  ]);
  const { users } = (await usersResponse.json()) as { users: User[] };
  const { clubs } = (await clubsResponse.json()) as { clubs: Pick<Club, "id" | "naam">[] };

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gebruikersbeheer</h1>
        <AdminNav current="/" />
      </div>
      <UsersTable clubs={clubs} users={users} />
    </main>
  );
}
