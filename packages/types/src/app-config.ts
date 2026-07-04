import type { Capability } from "./role";

// Admin-managed metadata for the homepage "Apps" grid (apps/main) — one row
// per Capability, see packages/db schema.prisma AppConfig.
export interface AppConfig {
  capability: Capability;
  title: string;
  imageUrl: string | null;
  visible: boolean;
  updatedAt: string;
}
