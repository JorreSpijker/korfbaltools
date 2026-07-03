import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@korfbaltools/db";
import { resetPasswordSchema } from "@korfbaltools/types";
import { requireAdmin } from "@/lib/require-user";
import { revokeAllSessionsForUser } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { createPasswordResetToken } from "@/lib/reset-token";
import { resend, RESET_PASSWORD_FROM } from "@/lib/resend";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

export async function POST(request: NextRequest, { params }: RouteParams) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return errorResponse("not_found", "Gebruiker niet gevonden");
  }

  await prisma.auditLog.create({
    data: {
      actorId: result.user.id,
      action: "password_reset",
      targetUserId: id,
      metadata: { mode: parsed.data.mode },
    },
  });

  if (parsed.data.mode === "temporary_password") {
    const temporaryPassword = randomBytes(9).toString("base64url");
    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(temporaryPassword) },
    });
    await revokeAllSessionsForUser(id);
    // Returned once so the admin can hand it to the user; never stored in plaintext.
    return NextResponse.json({ mode: "temporary_password", temporaryPassword });
  }

  const { rawToken } = await createPasswordResetToken(id);
  const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;

  await resend().emails.send({
    from: RESET_PASSWORD_FROM,
    to: target.email,
    subject: "Wachtwoord resetten - Korfbaltools.nl",
    react: ResetPasswordEmail({ resetUrl }),
  });

  return NextResponse.json({ mode: "reset_link" });
}
