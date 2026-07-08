import { NextRequest, NextResponse } from "next/server";
import { resendVerificationSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { createEmailVerificationToken } from "@/lib/verification-token";
import { resend, RESET_PASSWORD_FROM } from "@/lib/resend";
import { VerifyEmailEmail } from "@/emails/verify-email-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

// Same anti-enumeration shape as /api/forgot-password: always the same
// generic response, regardless of whether the account exists or is already verified.
const GENERIC_MESSAGE = "Als dit e-mailadres nog niet bevestigd is, ontvang je een nieuwe verificatie-e-mail.";

export async function POST(request: NextRequest) {
  const ipAllowed = await checkRateLimit(`resend-verification:ip:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!ipAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const body = await request.json().catch(() => null);
  const parsed = resendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email } = parsed.data;

  const emailAllowed = await checkRateLimit(`resend-verification:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt && !user.deactivatedAt) {
    const { rawToken } = await createEmailVerificationToken(user.id);
    const verifyUrl = `${APP_URL}/verify-email?token=${rawToken}`;

    await resend().emails.send({
      from: RESET_PASSWORD_FROM,
      to: user.email,
      subject: "Bevestig je e-mailadres - Korfbaltools.nl",
      react: VerifyEmailEmail({ verifyUrl }),
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
