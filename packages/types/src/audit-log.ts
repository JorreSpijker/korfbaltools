export const AUDIT_ACTIONS = [
  "role_changed",
  "club_changed",
  "capabilities_changed",
  "password_reset",
  "user_deactivated",
  "user_activated",
  "user_deleted",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: string;
  // Nullable because the actor or target user may since have been hard-deleted
  // (see AuditLog.actor/targetUser onDelete: SetNull) — the log entry itself
  // survives that so the audit trail doesn't disappear along with the account.
  actorId: string | null;
  action: AuditAction;
  targetUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
