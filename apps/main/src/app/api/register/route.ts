import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { hashPassword } from "@/lib/password";
import { toPublicUser } from "@/lib/user-mapper";
import { createEmailVerificationToken } from "@/lib/verification-token";
import { resend, RESET_PASSWORD_FROM } from "@/lib/resend";
import { VerifyEmailEmail } from "@/emails/verify-email-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

export async function POST(request: NextRequest) {
  const ipAllowed = await checkRateLimit(`register:ip:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!ipAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password, naam } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse("conflict", "Er bestaat al een account met dit e-mailadres");
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, naam: naam ?? null, consentedAt: new Date() },
  });

  // No auto-login: login is blocked until the address is verified below, so
  // creating a session here would just be an unusable cookie.
  const { rawToken } = await createEmailVerificationToken(user.id);
  const verifyUrl = `${APP_URL}/verify-email?token=${rawToken}`;

  await resend().emails.send({
    from: RESET_PASSWORD_FROM,
    to: user.email,
    subject: "Bevestig je e-mailadres - Korfbaltools.nl",
    react: VerifyEmailEmail({ verifyUrl }),
  });

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
