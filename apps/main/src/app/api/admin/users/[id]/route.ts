import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserRoleSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";
import { revokeAllSessionsForUser } from "@/lib/session";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }

  const lastLogin = await prisma.session.findFirst({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    user: { ...toPublicUser(user), lastLoginAt: lastLogin?.createdAt.toISOString() ?? null },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { role: parsed.data.role },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "role_changed",
        targetUserId: id,
        metadata: { oldRole: target.role, newRole: parsed.data.role },
      },
    });
    return updated;
  });

  // Role changes take effect immediately, not at next token expiry.
  await revokeAllSessionsForUser(id);

  return NextResponse.json({ user: toPublicUser(user) });
}

// Hard delete — irreversible, unlike the reversible /status deactivate.
// The audit entry's targetUserId is nulled out by the delete itself (see
// AuditLog.targetUser onDelete: SetNull), so the deleted user's email is
// snapshotted into metadata to keep the log entry meaningful afterward.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "user_deleted",
        targetUserId: id,
        metadata: { email: target.email, naam: target.naam, role: target.role },
      },
    });
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
