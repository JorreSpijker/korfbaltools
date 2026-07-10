import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { reviewClubRequestSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reviewClubRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || !target.pendingClubId) {
    return errorResponse("not_found", "Aanmelding niet gevonden");
  }
  if (result.scope.type === "club" && target.pendingClubId !== result.scope.clubId) {
    return errorResponse("not_found", "Aanmelding niet gevonden");
  }

  const pendingClubId = target.pendingClubId;

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: parsed.data.approve ? { clubId: pendingClubId, pendingClubId: null } : { pendingClubId: null },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: parsed.data.approve ? "club_join_approved" : "club_join_rejected",
        targetUserId: id,
        metadata: { clubId: pendingClubId },
      },
    });
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
