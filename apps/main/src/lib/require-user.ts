import "server-only";
import type { User } from "@korfbaltools/types";
import { getSessionUser } from "./session";
import { errorResponse } from "./api-response";

type Guarded = { user: User } | { response: ReturnType<typeof errorResponse> };

export async function requireUser(): Promise<Guarded> {
  const user = await getSessionUser();
  if (!user) return { response: errorResponse("unauthorized", "Niet ingelogd") };
  return { user };
}

// Used by every /api/admin/* route (see docs/plan.md section 4 "Rolgebaseerde
// toegang") — the gateway check in middleware.ts is defense in depth, not a
// substitute for this.
export async function requireAdmin(): Promise<Guarded> {
  const result = await requireUser();
  if ("response" in result) return result;
  if (result.user.role !== "admin") {
    return { response: errorResponse("forbidden", "Alleen voor admins") };
  }
  return result;
}

type GuardedVastspelen = { user: User & { clubId: string } } | { response: ReturnType<typeof errorResponse> };

// Used by every /api/vastspelen/* route. Vastspelen data (teams, spelers,
// wedstrijden) is club-scoped, so a user without a clubId has nothing to
// manage — treated the same as missing the capability (see
// docs/apps/vastspelen-plan.md, "Openstaande ontwerpkeuze"). Admins bypass
// the capability check (same reasoning as maintenance mode in
// middleware.ts), but still need a clubId — that's data-scoping, not
// permission-scoping, and there's no club-admin tier yet (plan.md section 4).
export async function requireVastspelen(): Promise<GuardedVastspelen> {
  const result = await requireUser();
  if ("response" in result) return result;
  const isAdmin = result.user.role === "admin";
  if ((!isAdmin && !result.user.capabilities.includes("vastspelen")) || !result.user.clubId) {
    return { response: errorResponse("forbidden", "Geen toegang tot de vastspelen-tool") };
  }
  return { user: { ...result.user, clubId: result.user.clubId } };
}

type ClubManagerScope = { type: "all" } | { type: "club"; clubId: string };
type GuardedClubManager = { user: User; scope: ClubManagerScope } | { response: ReturnType<typeof errorResponse> };

// Admits platform-admins (full scope) and club-scoped beheerders (own club
// only) — used by the /api/admin/users* and /api/admin/club-requests routes
// that both roles now share. requireAdmin() stays untouched and admin-only
// for routes that must stay platform-admin-exclusive (delete, reset-password,
// club reassignment, clubs CRUD, audit-log, app-config).
export async function requireClubManager(): Promise<GuardedClubManager> {
  const result = await requireUser();
  if ("response" in result) return result;
  if (result.user.role === "admin") {
    return { user: result.user, scope: { type: "all" } };
  }
  if (result.user.isClubBeheerder && result.user.clubId) {
    return { user: result.user, scope: { type: "club", clubId: result.user.clubId } };
  }
  return { response: errorResponse("forbidden", "Alleen voor admins of clubbeheerders") };
}
