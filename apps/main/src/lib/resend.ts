import "server-only";
import { Resend } from "resend";

// Lazy singleton: constructing eagerly at module scope throws when
// RESEND_API_KEY is unset, which breaks `next build`'s route data collection
// even though no email is sent at build time.
let client: Resend | undefined;

export function resend(): Resend {
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const RESET_PASSWORD_FROM = "Korfbaltools <no-reply@mail.korfbaltools.nl>";
