const isProd = process.env.NODE_ENV === "production";

// plan.md section 10: cookie domain is only set in production so the app keeps
// working on localhost. The __Secure- prefix additionally requires the Secure
// attribute, which breaks plain http://localhost, so dev uses a plain name too.
export const SESSION_COOKIE_NAME = isProd ? "__Secure-session" : "session";

export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    domain: isProd ? ".korfbaltools.nl" : undefined,
    expires: expiresAt,
  };
}
