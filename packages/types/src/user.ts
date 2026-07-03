import type { Capability, Role } from "./role";

// Public shape of a user, safe to send to the client and share across apps.
// passwordHash lives only in packages/db's Prisma model — never add it here.
export interface User {
  id: string;
  email: string;
  naam: string | null;
  role: Role;
  clubId: string | null;
  capabilities: Capability[];
  createdAt: string;
  // Only populated by the admin user listing (derived from the most recent
  // Session row) — omitted elsewhere since it takes an extra query to compute.
  lastLoginAt?: string | null;
}
