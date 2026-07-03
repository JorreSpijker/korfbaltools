export const AUDIT_ACTIONS = [
  "role_changed",
  "club_changed",
  "capabilities_changed",
  "password_reset",
  "user_deleted",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: string;
  actorId: string;
  action: AuditAction;
  targetUserId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
