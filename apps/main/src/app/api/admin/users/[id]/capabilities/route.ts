import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { updateUserCapabilitiesSchema } from "@korfbaltools/types";
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
  const parsed = updateUserCapabilitiesSchema.safeParse(body);
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
      data: { capabilities: parsed.data.capabilities },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "capabilities_changed",
        targetUserId: id,
        metadata: { oldCapabilities: target.capabilities, newCapabilities: parsed.data.capabilities },
      },
    });
    return updated;
  });

  return NextResponse.json({ user: toPublicUser(user) });
}
