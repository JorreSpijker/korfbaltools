import "server-only";
import { prisma } from "@korfbaltools/db";
import { CAPABILITIES, type Capability, type User } from "@korfbaltools/types";

// Structural per-app info (route) — stays in code because it's tied to the
// actual app deployment, unlike title/visibility which admins manage in
// apps/admin (AppConfig, see packages/db schema.prisma).
export const APP_ROUTES: Partial<Record<Capability, string>> = {
  teamindeling: "/teamindeling",
  vastspelen: "/vastspelen",
};

export function defaultTitle(capability: Capability): string {
  return capability.charAt(0).toUpperCase() + capability.slice(1);
}

export interface NavApp {
  capability: Capability;
  title: string;
  href: string;
}

// Apps for the toolbar nav: visible per admin settings, routed somewhere,
// *and* only for a logged-in user who holds that capability — the nav is not
// a discovery surface, only the homepage grid shows locked/unowned apps (see
// apps/main/src/app/page.tsx).
export async function getNavApps(user: User | null): Promise<NavApp[]> {
  if (!user) return [];

  const appConfigs = await prisma.appConfig.findMany();
  const configByCapability = new Map(appConfigs.map((config) => [config.capability, config]));

  // Admins always have vastspelen access, capability or not (see
  // requireVastspelen in lib/require-user.ts) — the nav pill should reflect that.
  const hasCapability = (capability: Capability) =>
    user.capabilities.includes(capability) || (capability === "vastspelen" && user.role === "admin");

  return CAPABILITIES.flatMap((capability) => {
    const config = configByCapability.get(capability);
    const href = APP_ROUTES[capability];
    if (!href || !(config?.visible ?? true) || !hasCapability(capability)) return [];
    return [{ capability, title: config?.title ?? defaultTitle(capability), href }];
  });
}
