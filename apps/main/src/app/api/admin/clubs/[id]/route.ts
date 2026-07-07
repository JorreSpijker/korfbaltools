import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateClubSchema } from "@korfbaltools/types";
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
  const parsed = updateClubSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.club.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Club niet gevonden");
  }

  const existing = await prisma.club.findFirst({ where: { naam: parsed.data.naam, NOT: { id } } });
  if (existing) {
    return errorResponse("conflict", "Er bestaat al een club met deze naam");
  }

  const club = await prisma.$transaction(async (tx) => {
    const updated = await tx.club.update({ where: { id }, data: { naam: parsed.data.naam } });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "club_updated",
        metadata: { clubId: id, oldNaam: target.naam, newNaam: updated.naam },
      },
    });
    return updated;
  });

  return NextResponse.json({ club: { id: club.id, naam: club.naam } });
}

// Blocked (not cascaded) while users are still linked — User.clubId has no
// onDelete, so the FK would reject it anyway; this returns a clear message
// instead of a raw Prisma error.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;

  const target = await prisma.club.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!target) {
    return errorResponse("not_found", "Club niet gevonden");
  }
  if (target._count.users > 0) {
    return errorResponse(
      "conflict",
      `Club heeft nog ${target._count.users} gekoppelde gebruiker(s) — koppel deze eerst los`,
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: { actorId: result.user.id, action: "club_deleted", metadata: { clubId: id, naam: target.naam } },
    });
    await tx.club.delete({ where: { id } });
  });

  return NextResponse.json({ ok: true });
}
