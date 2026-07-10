import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@korfbaltools/types";
import { getCurrentUser } from "./main-api";

// plan.md section 4 point 2: apps/admin never trusts the main app's gateway
// check alone — every page re-validates the role via /api/me itself.
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/unauthorized");
  }
  return user;
}

export type ClubManagerScope = { type: "all" } | { type: "club"; clubId: string };

// Same admission rule as apps/main's requireClubManager (see
// lib/require-user.ts there) — kept in this file since apps/admin never
// calls the main app's auth helpers directly, only its API (main-api.ts).
export async function requireClubManager(): Promise<{ user: User; scope: ClubManagerScope }> {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return { user, scope: { type: "all" } };
  }
  if (user?.isClubBeheerder && user.clubId) {
    return { user, scope: { type: "club", clubId: user.clubId } };
  }
  redirect("/unauthorized");
}
