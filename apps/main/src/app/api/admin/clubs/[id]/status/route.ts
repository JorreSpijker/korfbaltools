import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateClubStatusSchema } from "@korfbaltools/types";
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
  const parsed = updateClubStatusSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.club.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Club niet gevonden");
  }

  const club = await prisma.$transaction(async (tx) => {
    const updated = await tx.club.update({ where: { id }, data: { active: parsed.data.active } });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: parsed.data.active ? "club_activated" : "club_deactivated",
        metadata: { clubId: id },
      },
    });
    return updated;
  });

  return NextResponse.json({ club: { id: club.id, naam: club.naam, code: club.code, active: club.active } });
}
