import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserClubManagerSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireClubManager } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// A club can have multiple beheerders; both a platform-admin and a
// club-beheerder (scoped to their own club) may appoint/revoke them — see
// design spec docs/superpowers/specs/2026-07-11-clubbeheerder-toewijzen-design.md.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireClubManager();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserClubManagerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (result.scope.type === "club" && target.clubId !== result.scope.clubId)) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }
  if (!target.clubId) {
    return errorResponse("conflict", "Gebruiker heeft geen club — kan geen beheerder zijn");
  }

  if (!parsed.data.isClubBeheerder && target.isClubBeheerder) {
    const otherBeheerders = await prisma.user.count({
      where: { clubId: target.clubId, isClubBeheerder: true, NOT: { id } },
    });
    if (otherBeheerders === 0) {
      return errorResponse("conflict", "Kan niet intrekken: dit is de enige beheerder van de club");
    }
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
