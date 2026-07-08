import { NextRequest, NextResponse } from "next/server";
import type { User } from "@korfbaltools/types";

// Reachable even while maintenanceMode is on: /register per product
// requirement (registration stays open), /login and /reset-password so
// nobody gets locked out of authenticating, /under-construction itself
// so the rewrite target doesn't recurse, and /privacy since the cookie
// consent banner links there and it must stay reachable regardless of
// maintenance state. Admins bypass maintenance mode everywhere else too
// (checked per-request below via /api/me) — not just on /admin — so they
// can use the site normally while it's on.
// PWA assets (manifest, icons, service worker, offline fallback) also stay
// reachable so an already-installed PWA doesn't break during maintenance.
const MAINTENANCE_ALLOWLIST = [
  "/login",
  "/register",
  "/reset-password",
  "/under-construction",
  "/privacy",
  "/manifest.webmanifest",
  "/sw.js",
  "/offline",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-512-maskable.png",
  "/apple-icon",
];

function isMaintenanceAllowlisted(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  return MAINTENANCE_ALLOWLIST.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Middleware runs on the edge runtime, where Prisma isn't usable directly, so
// instead of querying the DB here we call this app's own /api/me (a Node.js
// route handler) and forward the incoming session cookie to it.
async function fetchCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const meResponse = await fetch(new URL("/api/me", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (!meResponse.ok) return null;
    const { user } = (await meResponse.json()) as { user: User };
    return user;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fetched at most once per request, shared by the maintenance bypass check
  // and the /admin, /teamindeling gating below.
  let user: User | null | undefined;
  const getUser = async () => {
    if (user === undefined) user = await fetchCurrentUser(request);
    return user;
  };

  if (!isMaintenanceAllowlisted(pathname)) {
    // Public, unauthenticated endpoint (see its route file) — same edge-runtime
    // constraint as the /api/me call below: no direct Prisma access here.
    // Fails open: a broken settings check must never 500 the entire site.
    try {
      const settingsResponse = await fetch(new URL("/api/settings", request.url));
      if (settingsResponse.ok) {
        const { maintenanceMode } = (await settingsResponse.json()) as { maintenanceMode: boolean };
        if (maintenanceMode) {
          const currentUser = await getUser();
          if (currentUser?.role !== "admin") {
            return NextResponse.rewrite(new URL("/under-construction", request.url));
          }
        }
      }
    } catch {
      // Ignore — treat as maintenance mode off rather than failing the request.
    }
  }

  // Gateway check from plan.md section 4: only pass the /admin rewrite through
  // if the caller is an admin. This is defense in depth — apps/admin re-checks
  // the role itself on every page/API call, it doesn't trust this middleware.
  if (pathname.startsWith("/admin") || pathname.startsWith("/teamindeling")) {
    const currentUser = await getUser();
    if (!currentUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/admin") && currentUser.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Tool apps are gated per-user via capabilities (plan.md section 7/9), not role.
    if (pathname.startsWith("/teamindeling") && !currentUser.capabilities.includes("teamindeling")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
