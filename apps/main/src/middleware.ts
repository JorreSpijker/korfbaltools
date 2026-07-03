import { NextRequest, NextResponse } from "next/server";
import type { User } from "@korfbaltools/types";

// Gateway check from plan.md section 4: only pass the /admin rewrite through
// if the caller is an admin. This is defense in depth — apps/admin re-checks
// the role itself on every page/API call, it doesn't trust this middleware.
//
// Middleware runs on the edge runtime, where Prisma isn't usable directly, so
// instead of querying the DB here we call this app's own /api/me (a Node.js
// route handler) and forward the incoming session cookie to it.
export async function middleware(request: NextRequest) {
  const meResponse = await fetch(new URL("/api/me", request.url), {
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (!meResponse.ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { user } = (await meResponse.json()) as { user: User };

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Tool apps are gated per-user via capabilities (plan.md section 7/9), not role.
  if (request.nextUrl.pathname.startsWith("/teamplanner")) {
    if (!user.capabilities.includes("teamplanner")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teamplanner/:path*"],
};
