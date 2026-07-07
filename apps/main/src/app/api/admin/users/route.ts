import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@korfbaltools/db";
import { createUserSchema } from "@korfbaltools/types";
import { toPublicUser } from "@/lib/user-mapper";
import { requireAdmin } from "@/lib/require-user";
import { hashPassword } from "@/lib/password";
import { createPasswordResetToken } from "@/lib/reset-token";
import { resend, RESET_PASSWORD_FROM } from "@/lib/resend";
import { InviteUserEmail } from "@/emails/invite-user-email";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

export async function GET() {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const lastLogins = await prisma.session.groupBy({
    by: ["userId"],
    _max: { createdAt: true },
  });
  const lastLoginByUserId = new Map(lastLogins.map((row) => [row.userId, row._max.createdAt]));

  return NextResponse.json({
    users: users.map((user) => ({
      ...toPublicUser(user),
      lastLoginAt: lastLoginByUserId.get(user.id)?.toISOString() ?? null,
    })),
  });
}

// Admin creates the account; no password is set here, an invite email with
// a set-password link goes out instead (same reset-token mechanism as the
// existing admin "reset-password" reset_link mode).
export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if ("response" in result) return result.response;

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, naam, role, capabilities, clubId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("conflict", "Er bestaat al een account met dit e-mailadres");
  }

  // Unusable placeholder — never revealed, the user replaces it via the
  // invite link before they can ever log in.
  const placeholderPasswordHash = await hashPassword(randomBytes(32).toString("hex"));

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        naam: naam ?? null,
        role,
        capabilities,
        clubId,
        passwordHash: placeholderPasswordHash,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId: result.user.id,
        action: "user_invited",
        targetUserId: created.id,
        metadata: { email, role },
      },
    });
    return created;
  });

  const { rawToken } = await createPasswordResetToken(user.id);
  const setPasswordUrl = `${APP_URL}/reset-password?token=${rawToken}`;

  await resend().emails.send({
    from: RESET_PASSWORD_FROM,
    to: user.email,
    subject: "Welkom bij Korfbaltools.nl",
    react: InviteUserEmail({ setPasswordUrl }),
  });

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
