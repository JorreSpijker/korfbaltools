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
