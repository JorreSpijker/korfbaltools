import { NextRequest, NextResponse } from "next/server";
import type { User } from "@korfbaltools/types";

// Reachable even while maintenanceMode is on: /register per product
// requirement (registration stays open), /login and /reset-password so
// nobody — including the admin who needs to turn maintenance back off via
// /admin — gets locked out of authenticating, and /under-construction
// itself so the rewrite target doesn't recurse.
const MAINTENANCE_ALLOWLIST = ["/login", "/register", "/reset-password", "/under-construction"];

function isMaintenanceAllowed(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  return MAINTENANCE_ALLOWLIST.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isMaintenanceAllowed(pathname)) {
    // Public, unauthenticated endpoint (see its route file) — same edge-runtime
    // constraint as the /api/me call below: no direct Prisma access here.
    const settingsResponse = await fetch(new URL("/api/settings", request.url));
    if (settingsResponse.ok) {
      const { maintenanceMode } = (await settingsResponse.json()) as { maintenanceMode: boolean };
      if (maintenanceMode) {
        return NextResponse.rewrite(new URL("/under-construction", request.url));
      }
    }
  }

  // Gateway check from plan.md section 4: only pass the /admin rewrite through
  // if the caller is an admin. This is defense in depth — apps/admin re-checks
  // the role itself on every page/API call, it doesn't trust this middleware.
  //
  // Middleware runs on the edge runtime, where Prisma isn't usable directly, so
  // instead of querying the DB here we call this app's own /api/me (a Node.js
  // route handler) and forward the incoming session cookie to it.
  if (pathname.startsWith("/admin") || pathname.startsWith("/teamplanner")) {
    const meResponse = await fetch(new URL("/api/me", request.url), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!meResponse.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { user } = (await meResponse.json()) as { user: User };

    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Tool apps are gated per-user via capabilities (plan.md section 7/9), not role.
    if (pathname.startsWith("/teamplanner") && !user.capabilities.includes("teamplanner")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
