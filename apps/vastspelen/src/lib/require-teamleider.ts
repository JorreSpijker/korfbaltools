import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@korfbaltools/types";
import { getCurrentUser } from "./main-api";

// plan.md section 4 point 2: apps/vastspelen never trusts the main app's
// gateway check alone — every page re-validates the capability via /api/me
// itself. clubId is required too: vastspelen data is club-scoped (see
// docs/apps/vastspelen-plan.md, "Openstaande ontwerpkeuze"). Admins bypass
// the capability check but still need a clubId — mirrors requireVastspelen
// in apps/main/src/lib/require-user.ts.
export async function requireTeamleider(): Promise<User & { clubId: string }> {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  if (!user || (!isAdmin && !user.capabilities.includes("vastspelen")) || !user.clubId) {
    redirect("/unauthorized");
  }
  return { ...user, clubId: user.clubId };
}
