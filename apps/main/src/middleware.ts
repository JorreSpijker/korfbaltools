import { NextRequest, NextResponse } from "next/server";
import { APP_KEY_BY_PATH_PREFIX, isAppEnabled } from "@/lib/apps";

// Enige poortwachter die overblijft: staat de gevraagde app aan? De rewrites
// naar de losse app-deployments (next.config.mjs, vercel.json) gebeuren pas
// hierna, dus een uitgeschakelde app is nergens meer bereikbaar.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = APP_KEY_BY_PATH_PREFIX.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (match && !isAppEnabled(match[1])) {
    return NextResponse.rewrite(new URL("/niet-beschikbaar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
