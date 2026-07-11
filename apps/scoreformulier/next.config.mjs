import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-zone setup (apps/main rewrites /scoreformulier/* here) — without a
  // basePath, this app's /_next/static/* asset URLs collide with apps/main's.
  // https://nextjs.org/docs/app/guides/multi-zones
  basePath: "/scoreformulier",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/scoreformulier-logic", "@korfbaltools/config", "@korfbaltools/ui"],
};

export default nextConfig;
