import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserClubSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateUserClubSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }

  if (parsed.data.clubId) {
    const club = await prisma.club.findUnique({ where: { id: parsed.data.clubId } });
    if (!club) {
      return errorResponse("not_found", "Club niet gevonden");
    }
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { clubId: parsed.data.clubId },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "club_changed",
        targetUserId: id,
        metadata: { oldClubId: target.clubId, newClubId: parsed.data.clubId },
      },
    });
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
