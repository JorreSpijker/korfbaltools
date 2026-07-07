import "server-only";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES, type Capability } from "@korfbaltools/types";

// Structural per-app info (route) — stays in code because it's tied to the
// actual app deployment, unlike title/visibility which admins manage in
// apps/admin (AppConfig, see packages/db schema.prisma).
export const APP_ROUTES: Partial<Record<Capability, string>> = {
  teamplanner: "/teamplanner",
};

export function defaultTitle(capability: Capability): string {
  return capability.charAt(0).toUpperCase() + capability.slice(1);
}

export interface NavApp {
  capability: Capability;
  title: string;
  href: string;
}

// Apps for the toolbar nav: visible per admin settings *and* routed
// somewhere. Unrouted apps still show on the homepage grid (see
// apps/main/src/app/page.tsx), just without a nav link.
export async function getNavApps(): Promise<NavApp[]> {
  const appConfigs = await prisma.appConfig.findMany();
  const configByCapability = new Map(appConfigs.map((config) => [config.capability, config]));

  return CAPABILITIES.flatMap((capability) => {
    const config = configByCapability.get(capability);
    const href = APP_ROUTES[capability];
    if (!href || !(config?.visible ?? true)) return [];
    return [{ capability, title: config?.title ?? defaultTitle(capability), href }];
  });
}
