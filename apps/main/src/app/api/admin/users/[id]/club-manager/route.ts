import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserClubManagerSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Admin-only — a club can have multiple beheerders, but only a
// platform-admin appoints/revokes them (design spec section 4).
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserClubManagerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }
  if (!target.clubId) {
    return errorResponse("conflict", "Gebruiker heeft geen club — kan geen beheerder zijn");
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { isClubBeheerder: parsed.data.isClubBeheerder },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "club_manager_changed",
        targetUserId: id,
        metadata: { clubId: target.clubId, isClubBeheerder: parsed.data.isClubBeheerder },
      },
    });
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
