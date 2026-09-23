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

    // Local dev: proxy /trainingen/* to apps/trainingen instead of the production
    // trainingen.vercel.app deployment.
    const trainingenAppUrl = process.env.TRAININGEN_APP_URL;
    if (trainingenAppUrl) {
      rewrites.push({
        // apps/trainingen has basePath: "/trainingen" (see its next.config.mjs), so it
        // already expects requests prefixed with /trainingen — pass it through as-is.
        source: "/trainingen/:path*",
        destination: `${trainingenAppUrl}/trainingen/:path*`,
      });
    }

    // Local dev: proxy /vastspelen/* to apps/vastspelen instead of the production
    // vastspelen.vercel.app deployment used in vercel.json (see docs/plan.md section 10).
    const vastspelenAppUrl = process.env.VASTSPELEN_APP_URL;
    if (vastspelenAppUrl) {
      rewrites.push({
        // apps/vastspelen has basePath: "/vastspelen" (see its next.config.mjs), so it
        // already expects requests prefixed with /vastspelen — pass it through as-is.
        source: "/vastspelen/:path*",
        destination: `${vastspelenAppUrl}/vastspelen/:path*`,
      });
    }

    // Local dev: proxy /scoreformulier/* to apps/scoreformulier instead of the production
    // scoreformulier.vercel.app deployment.
    const scoreformulierAppUrl = process.env.SCOREFORMULIER_APP_URL;
    if (scoreformulierAppUrl) {
      rewrites.push({
        // apps/scoreformulier has basePath: "/scoreformulier" (see its next.config.mjs), so it
        // already expects requests prefixed with /scoreformulier — pass it through as-is.
        source: "/scoreformulier/:path*",
        destination: `${scoreformulierAppUrl}/scoreformulier/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
