// Single-row platform-wide settings — see packages/db schema.prisma
// PlatformSettings. When maintenanceMode is on, apps/main's middleware
// rewrites everything except /login, /register, /reset-password, and
// /admin to /under-construction.
export interface PlatformSettings {
  maintenanceMode: boolean;
  updatedAt: string;
}
