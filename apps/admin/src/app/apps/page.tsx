import { Settings2 } from "lucide-react";
import type { AppConfig, PlatformSettings } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { ensureOk, fetchMainApi } from "@/lib/main-api";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AppConfigRow } from "@/components/app-config-row";
import { MaintenanceModeToggle } from "@/components/maintenance-mode-toggle";
import { Container } from "@korfbaltools/ui";

export default async function AppsSettingsPage() {
  await requireAdmin();

  const [appsResponse, settingsResponse] = await Promise.all([
    fetchMainApi("/api/admin/apps"),
    fetchMainApi("/api/admin/settings"),
  ]);
  await ensureOk(appsResponse, "Kan app-instellingen niet laden");
  await ensureOk(settingsResponse, "Kan platforminstellingen niet laden");
  const { apps } = (await appsResponse.json()) as { apps: AppConfig[] };
  const { settings } = (await settingsResponse.json()) as { settings: Pick<PlatformSettings, "maintenanceMode"> };

  return (
    <main className="py-10">
      <Container>
        <AdminPageHeader
          icon={Settings2}
          title="App-instellingen"
          description="Onderhoudsmodus en per-app titel, afbeelding en zichtbaarheid op de homepage."
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-neutral-900">Platform</h2>
          <MaintenanceModeToggle settings={settings} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-neutral-900">Apps</h2>
          <p className="text-sm text-neutral-600">
            Titel, afbeelding en zichtbaarheid van elke app op de homepage van korfbaltools.nl.
          </p>
          <div className="flex flex-col gap-4">
            {apps.map((app) => (
              <AppConfigRow key={app.capability} app={app} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
