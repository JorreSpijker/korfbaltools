import { NextResponse } from "next/server";
import { getNavApps } from "@/lib/apps";
import { getSessionUser } from "@/lib/session";

// Same title/visibility/capability info as the homepage "Apps" grid, just for
// apps/admin and apps/teamindeling to render the shared toolbar nav (see
// packages/ui KorfbalToolBar). Relies on the caller forwarding the session
// cookie — see apps/admin and apps/teamindeling's lib/main-api.ts.
export async function GET() {
  const user = await getSessionUser();
  const apps = await getNavApps(user);
  return NextResponse.json({ apps });
}
