import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the monorepo root so Next.js doesn't get confused by lockfiles
  // outside this repo (e.g. in a parent directory).
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/types", "@korfbaltools/db", "@korfbaltools/config", "@korfbaltools/ui"],
  async rewrites() {
    const rewrites = [];

    // Local dev: proxy /admin/* to apps/admin instead of the production
    // admin.vercel.app deployment used in vercel.json (see docs/plan.md section 10).
    const adminAppUrl = process.env.ADMIN_APP_URL;
    if (adminAppUrl) {
      rewrites.push({
        // apps/admin has basePath: "/admin" (see its next.config.mjs), so it
        // already expects requests prefixed with /admin — pass it through as-is.
        source: "/admin/:path*",
        destination: `${adminAppUrl}/admin/:path*`,
      });
    }

    // Local dev: proxy /teamplanner/* to the Vite dev server in apps/teamplanner.
    const teamplannerAppUrl = process.env.TEAMPLANNER_APP_URL;
    if (teamplannerAppUrl) {
      rewrites.push(
        // apps/teamplanner has base: "/teamplanner/" (see its vite.config.js) and 404s
        // on the bare, no-trailing-slash root — force the slash on for that exact case.
        {
          source: "/teamplanner",
          destination: `${teamplannerAppUrl}/teamplanner/`,
        },
        {
          source: "/teamplanner/:path+",
          destination: `${teamplannerAppUrl}/teamplanner/:path+`,
        },
      );
    }

    return rewrites;
  },
};

export default nextConfig;
