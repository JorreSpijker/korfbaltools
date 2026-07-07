import { History } from "lucide-react";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Container } from "@korfbaltools/ui";

interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetUserId: string | null;
  targetUserEmail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default async function AuditLogPage() {
  await requireAdmin();

  const response = await fetchMainApi("/api/admin/audit-log");
  await ensureOk(response, "Kan audit log niet laden");
  const { entries } = (await response.json()) as { entries: AuditLogEntry[] };

  return (
    <main className="py-10">
      <Container>
        <AdminPageHeader
          icon={History}
          title="Audit log"
          description="Wie wijzigde wat, en wanneer — elke beheerdersactie op gebruikers en app-instellingen."
        />
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-200 py-16 text-center">
            <History className="h-8 w-8 text-neutral-400" />
            <p className="font-medium text-neutral-900">Nog geen acties gelogd</p>
            <p className="max-w-sm text-sm text-neutral-600">
              Zodra een beheerder een gebruiker of app-instelling wijzigt, verschijnt dat hier.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wanneer</TableHead>
                <TableHead>Actie</TableHead>
                <TableHead>Door</TableHead>
                <TableHead>Op</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-neutral-600">
                    {new Date(entry.createdAt).toLocaleString("nl-NL")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">{entry.actorEmail}</TableCell>
                  <TableCell className="max-w-48 truncate">
                    {entry.targetUserId ? entry.targetUserEmail : "—"}
                  </TableCell>
                  <TableCell
                    className="max-w-xs truncate font-mono text-xs text-neutral-500"
                    title={JSON.stringify(entry.metadata)}
                  >
                    {JSON.stringify(entry.metadata)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Container>
    </main>
  );
}
