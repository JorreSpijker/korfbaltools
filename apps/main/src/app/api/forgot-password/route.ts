import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@korfbaltools/types";
import { prisma } from "@korfbaltools/db";
import { createPasswordResetToken } from "@/lib/reset-token";
import { resend, RESET_PASSWORD_FROM } from "@/lib/resend";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse, validationErrorResponse } from "@/lib/api-response";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://korfbaltools.nl";

// Always the same generic response, whether or not the email exists —
// otherwise this endpoint becomes a user-enumeration oracle.
const GENERIC_MESSAGE = "Als dit e-mailadres bij ons bekend is, ontvang je een e-mail om je wachtwoord te resetten.";

export async function POST(request: NextRequest) {
  const ipAllowed = await checkRateLimit(`forgot-password:ip:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!ipAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email } = parsed.data;

  const emailAllowed = await checkRateLimit(`forgot-password:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailAllowed) {
    return errorResponse("rate_limited", "Te veel pogingen, probeer het later opnieuw");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.deactivatedAt) {
    const { rawToken } = await createPasswordResetToken(user.id);
    const resetUrl = `${APP_URL}/reset-password?token=${rawToken}`;

    await resend().emails.send({
      from: RESET_PASSWORD_FROM,
      to: user.email,
      subject: "Wachtwoord resetten - Korfbaltools.nl",
      react: ResetPasswordEmail({ resetUrl }),
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
