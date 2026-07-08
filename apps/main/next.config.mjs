import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the monorepo root so Next.js doesn't get confused by lockfiles
  // outside this repo (e.g. in a parent directory).
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/types", "@korfbaltools/db", "@korfbaltools/config", "@korfbaltools/ui"],
  // pnpm nests the generated Prisma client under .pnpm/@prisma+client@.../node_modules/.prisma/client —
  // Vercel's file tracer doesn't follow that path on its own and drops the query engine
  // binary from the deployed bundle (https://pris.ly/d/engine-not-found-nextjs).
  outputFileTracingIncludes: {
    "/**/*": ["../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*"],
  },
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

    // Local dev: proxy /teamindeling/* to apps/teamindeling instead of the production
    // teamindeling.vercel.app deployment used in vercel.json (see docs/plan.md section 10).
    const teamindelingAppUrl = process.env.TEAMINDELING_APP_URL;
    if (teamindelingAppUrl) {
      rewrites.push({
        // apps/teamindeling has basePath: "/teamindeling" (see its next.config.mjs), so it
        // already expects requests prefixed with /teamindeling — pass it through as-is.
        source: "/teamindeling/:path*",
        destination: `${teamindelingAppUrl}/teamindeling/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
