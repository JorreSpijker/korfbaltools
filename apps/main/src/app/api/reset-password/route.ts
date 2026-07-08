import { NextRequest, NextResponse } from "next/server";
import { confirmPasswordResetSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { hashPassword } from "@/lib/password";
import { consumePasswordResetToken } from "@/lib/reset-token";
import { revokeAllSessionsForUser } from "@/lib/session";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = confirmPasswordResetSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const record = await consumePasswordResetToken(parsed.data.token);
  if (!record) {
    return errorResponse("unauthorized", "Reset-link is ongeldig of verlopen");
  }

  const target = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!target || target.deactivatedAt) {
    return errorResponse("unauthorized", "Reset-link is ongeldig of verlopen");
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      // This route is shared by admin-invite, admin-triggered reset, and the
      // self-service forgot-password flow — clicking a real emailed link is
      // itself proof of email ownership in all three cases, so stamp
      // verification here too rather than requiring a separate verify-email
      // step for those flows. Only direct /register signups go through the
      // dedicated verify-email flow instead.
      emailVerifiedAt: target.emailVerifiedAt ?? new Date(),
    },
  });
  await revokeAllSessionsForUser(record.userId);

  return NextResponse.json({ ok: true });
}
