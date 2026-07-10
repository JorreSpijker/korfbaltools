import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateProfileSchema } from "@korfbaltools/types";
import { requireUser } from "@/lib/require-user";
import { toPublicUser } from "@/lib/user-mapper";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

// Tool apps call this both client-side (same-origin via the rewrite, cookie
// sent automatically) and server-side (must forward the incoming Cookie
// header themselves — see docs/plan.md section 6).
export async function GET() {
  const result = await requireUser();
  if ("response" in result) return result.response;
  return NextResponse.json({ user: result.user });
}

export async function PATCH(request: NextRequest) {
  const result = await requireUser();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, naam, clubId } = parsed.data;

  if (email !== result.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("conflict", "Er bestaat al een account met dit e-mailadres");
    }
  }

  // Leaving a club (clubId: null) takes effect immediately — no approval
  // needed to remove yourself. Joining a *different* club goes through
  // pendingClubId instead, reviewed by an admin/beheerder (see
  // /api/admin/club-requests) rather than being applied directly.
  let newClubId: string | null | undefined;
  let newPendingClubId: string | undefined;

  if (clubId !== undefined) {
    if (clubId === null) {
      newClubId = null;
    } else if (clubId !== result.user.clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club) {
        return errorResponse("not_found", "Club niet gevonden");
      }
      newPendingClubId = clubId;
    }
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: result.user.id },
      data: {
        email,
        naam: naam ?? null,
        ...(newClubId !== undefined ? { clubId: newClubId } : {}),
        ...(newPendingClubId !== undefined ? { pendingClubId: newPendingClubId } : {}),
      },
    });
    if (newPendingClubId !== undefined) {
      await tx.auditLog.create({
        data: { actorId: result.user.id, action: "club_join_requested", metadata: { clubId: newPendingClubId } },
      });
    }
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
