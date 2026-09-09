import "server-only";
import type { KorfbalToolBarNavApp } from "@korfbaltools/ui";

// Welke apps in de toolbar staan wordt door apps/main bepaald (zie zijn
// lib/apps.ts), zodat er één bron van waarheid is.
const MAIN_APP_URL = process.env.MAIN_APP_URL ?? "http://localhost:3000";

export async function getNavApps(): Promise<KorfbalToolBarNavApp[]> {
  const response = await fetch(`${MAIN_APP_URL}/api/apps`, { cache: "no-store" });
  if (!response.ok) return [];
  const { apps } = (await response.json()) as { apps: KorfbalToolBarNavApp[] };
  return apps;
}
