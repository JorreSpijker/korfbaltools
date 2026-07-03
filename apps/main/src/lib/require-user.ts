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
