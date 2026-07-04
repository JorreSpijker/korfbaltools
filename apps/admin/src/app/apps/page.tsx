import type { AppConfig, PlatformSettings } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-admin";
import { fetchMainApi } from "@/lib/main-api";
import { AdminNav } from "@/components/admin-nav";
import { AppConfigRow } from "@/components/app-config-row";
import { MaintenanceModeToggle } from "@/components/maintenance-mode-toggle";

export default async function AppsSettingsPage() {
  await requireAdmin();

  const [appsResponse, settingsResponse] = await Promise.all([
    fetchMainApi("/api/admin/apps"),
    fetchMainApi("/api/admin/settings"),
  ]);
  const { apps } = (await appsResponse.json()) as { apps: AppConfig[] };
  const { settings } = (await settingsResponse.json()) as { settings: Pick<PlatformSettings, "maintenanceMode"> };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">App-instellingen</h1>
        <AdminNav current="/apps" />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-900">Platform</h2>
        <MaintenanceModeToggle settings={settings} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-900">Apps</h2>
        <p className="text-sm text-neutral-500">
          Titel, afbeelding en zichtbaarheid van elke app op de homepage van korfbaltools.nl.
        </p>
        <div className="flex flex-col gap-4">
          {apps.map((app) => (
            <AppConfigRow key={app.capability} app={app} />
          ))}
        </div>
      </section>
    </main>
  );
}
