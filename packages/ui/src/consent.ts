const COOKIE_NAME = "cookie-consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 dagen
const CHANGE_EVENT = "cookie-consent-change";

export type ConsentState = "granted" | "denied";

export function getConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )cookie-consent=([^;]*)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(state: ConsentState) {
  document.cookie = `${COOKIE_NAME}=${state}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
}

export function onConsentChange(callback: (state: ConsentState) => void) {
  const handler = (event: Event) => callback((event as CustomEvent<ConsentState>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
