import type { User as DbUser } from "@korfbaltools/db";
import type { User } from "@korfbaltools/types";

export function toPublicUser(user: DbUser): User {
  return {
    id: user.id,
    email: user.email,
    naam: user.naam,
    role: user.role,
    clubId: user.clubId,
    capabilities: user.capabilities,
    createdAt: user.createdAt.toISOString(),
  };
}
