import { requireAdmin } from "@/lib/require-admin";
import { fetchMainApi } from "@/lib/main-api";
import { AdminNav } from "../../../../../packages/ui/src/admin-nav";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetUserEmail: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default async function AuditLogPage() {
  await requireAdmin();

  const response = await fetchMainApi("/api/admin/audit-log");
  const { entries } = (await response.json()) as { entries: AuditLogEntry[] };

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col">
        <AdminNav current="/" />
        <h1 className="text-2xl font-semibold">Gebruikersbeheer</h1>
      </div>
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
              <TableCell>{new Date(entry.createdAt).toLocaleString("nl-NL")}</TableCell>
              <TableCell>{entry.action}</TableCell>
              <TableCell>{entry.actorEmail}</TableCell>
              <TableCell>{entry.targetUserEmail}</TableCell>
              <TableCell className="text-xs text-neutral-500">{JSON.stringify(entry.metadata)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
