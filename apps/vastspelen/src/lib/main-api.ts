import "server-only";
import type { ApiErrorBody } from "@korfbaltools/types";
import type { KorfbalToolBarNavApp } from "@korfbaltools/ui";

// Only apps/main talks to the database directly (plan.md section 10) —
// apps/vastspelen always goes through the main API.
const MAIN_APP_URL = process.env.MAIN_APP_URL ?? "http://localhost:3000";

export async function fetchMainApi(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${MAIN_APP_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
}

// Same list as the homepage "Apps" grid, just for the shared toolbar nav
// (see packages/ui KorfbalToolBar).
export async function getNavApps(): Promise<KorfbalToolBarNavApp[]> {
  const response = await fetchMainApi("/api/apps");
  if (!response.ok) return [];
  const { apps } = (await response.json()) as { apps: KorfbalToolBarNavApp[] };
  return apps;
}

export async function parseApiError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error.message ?? "Er ging iets mis";
}

// Server components don't get to show an inline error per fetch — an
// uncaught throw here is what the nearest error.tsx boundary catches, so
// every page-level fetch needs to actually throw instead of silently
// destructuring a failed response's body as if it succeeded.
export async function ensureOk(response: Response, context: string): Promise<void> {
  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(`${context}: ${message}`);
  }
}
