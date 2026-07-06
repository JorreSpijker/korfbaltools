import Link from "next/link";
import { notFound } from "next/navigation";
import type { Club, User } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { fetchMainApi } from "@/lib/main-api";
import { UserEditForm } from "@/components/user-edit-form";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  await requireAdmin();
  const { id } = await params;

  const [userResponse, clubsResponse] = await Promise.all([
    fetchMainApi(`/api/admin/users/${id}`),
    fetchMainApi("/api/clubs"),
  ]);

  if (userResponse.status === 404) {
    notFound();
  }

  const { user } = (await userResponse.json()) as { user: User };
  const { clubs } = (await clubsResponse.json()) as { clubs: Pick<Club, "id" | "naam">[] };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{user.naam ?? user.email}</h1>
        <Link className="text-sm text-primary-600 underline" href="/">
          Terug naar gebruikers
        </Link>
      </div>
      <UserEditForm clubs={clubs} user={user} />
    </main>
  );
}
