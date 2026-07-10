import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createClubSchema } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

// Admin-only list, unlike the public /api/clubs — includes userCount so the
// admin UI can warn before a delete that would otherwise hit the FK
// constraint on User.clubId.
export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const clubs = await prisma.club.findMany({
    select: { id: true, naam: true, code: true, _count: { select: { users: true } } },
    orderBy: { naam: "asc" },
  });

  return NextResponse.json({
    clubs: clubs.map((club) => ({ id: club.id, naam: club.naam, code: club.code, userCount: club._count.users })),
  });
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createClubSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { naam, code, beheerderEmail } = parsed.data;

  const existingNaam = await prisma.club.findFirst({ where: { naam } });
  if (existingNaam) {
    return errorResponse("conflict", "Er bestaat al een club met deze naam");
  }
  const existingCode = await prisma.club.findFirst({ where: { code } });
  if (existingCode) {
    return errorResponse("conflict", "Er bestaat al een club met deze ClubID");
  }

  let beheerder = null;
  if (beheerderEmail) {
    beheerder = await prisma.user.findUnique({ where: { email: beheerderEmail } });
    if (!beheerder) {
      return errorResponse("not_found", "Gebruiker bestaat nog niet, moet eerst zelf registreren");
    }
  }

  const club = await prisma.$transaction(async (tx) => {
    const created = await tx.club.create({ data: { naam, code } });
    await tx.auditLog.create({
      data: { actorId: result.user.id, action: "club_created", metadata: { clubId: created.id, naam, code } },
    });
    if (beheerder) {
      await tx.user.update({ where: { id: beheerder.id }, data: { clubId: created.id, isClubBeheerder: true } });
      await tx.auditLog.create({
        data: {
          actorId: result.user.id,
          action: "club_manager_changed",
          targetUserId: beheerder.id,
          metadata: { clubId: created.id, isClubBeheerder: true },
        },
      });
    }
    return created;
  });

  return NextResponse.json(
    { club: { id: club.id, naam: club.naam, code: club.code, userCount: beheerder ? 1 : 0 } },
    { status: 201 },
  );
}
