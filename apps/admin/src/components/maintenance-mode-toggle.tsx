"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiErrorBody, PlatformSettings } from "@korfbaltools/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MaintenanceModeToggleProps {
  settings: Pick<PlatformSettings, "maintenanceMode">;
}

export function MaintenanceModeToggle({ settings }: MaintenanceModeToggleProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setMaintenanceMode(maintenanceMode: boolean) {
    setPending(true);
    setError(null);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenanceMode }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json()) as ApiErrorBody;
      setError(body.error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-neutral-200 p-6">
      <div className="flex items-center gap-2">
        <Checkbox
          id="maintenance-mode"
          checked={settings.maintenanceMode}
          disabled={pending}
          onCheckedChange={(checked) => setMaintenanceMode(checked === true)}
        />
        <Label htmlFor="maintenance-mode">Under construction</Label>
      </div>
      <p className="text-sm text-neutral-500">
        Zet de hele site (behalve inloggen, registreren en dit admin-paneel) op een "onderhoud"-pagina. Bestaande
        en nieuwe gebruikers kunnen tijdens onderhoud nog steeds inloggen en registreren.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
