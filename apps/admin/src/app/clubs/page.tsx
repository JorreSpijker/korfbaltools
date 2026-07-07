import { Building2 } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ClubsTable, type AdminClub } from "@/components/clubs-table";
import { Container } from "@korfbaltools/ui";

export default async function AdminClubsPage() {
  await requireAdmin();

  const response = await fetchMainApi("/api/admin/clubs");
  await ensureOk(response, "Kan clubs niet laden");
  const { clubs } = (await response.json()) as { clubs: AdminClub[] };

  return (
    <main className="py-10">
      <Container>
        <AdminPageHeader icon={Building2} title="Clubs" description="Clubs aanmaken, hernoemen en verwijderen." />
        <ClubsTable clubs={clubs} />
      </Container>
    </main>
  );
}
