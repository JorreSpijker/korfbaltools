import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserStatusSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";
import { revokeAllSessionsForUser } from "@/lib/session";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserStatusSchema.safeParse(body);
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
      data: { deactivatedAt: parsed.data.deactivated ? new Date() : null },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: parsed.data.deactivated ? "user_deactivated" : "user_activated",
        targetUserId: id,
        metadata: {},
      },
    });
    return updated;
  });

  // A deactivation should take effect immediately, not at next token expiry.
  if (parsed.data.deactivated) {
    await revokeAllSessionsForUser(id);
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
