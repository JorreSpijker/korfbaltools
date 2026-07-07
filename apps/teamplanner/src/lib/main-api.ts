import "server-only";
import { headers } from "next/headers";
import type { User } from "@korfbaltools/types";
import type { KorfbalToolBarNavApp } from "@korfbaltools/ui";

// Only apps/main talks to the database/email provider directly (plan.md
// section 10) — apps/teamplanner always goes through the main API, and
// forwards the incoming Cookie header itself since this is a server-side
// call, not a browser fetch (see plan.md section 6).
const MAIN_APP_URL = process.env.MAIN_APP_URL ?? "http://localhost:3000";

async function forwardedCookieHeader(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get("cookie") ?? "";
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${MAIN_APP_URL}/api/me`, {
    headers: { cookie: await forwardedCookieHeader() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const { user } = (await response.json()) as { user: User };
  return user;
}

// Public — same info as the homepage "Apps" grid, just for the shared
// toolbar nav (see packages/ui KorfbalToolBar).
export async function getNavApps(): Promise<KorfbalToolBarNavApp[]> {
  const response = await fetch(`${MAIN_APP_URL}/api/apps`, { cache: "no-store" });
  if (!response.ok) return [];
  const { apps } = (await response.json()) as { apps: KorfbalToolBarNavApp[] };
  return apps;
}
