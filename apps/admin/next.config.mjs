import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the multi-zone setup (apps/main rewrites /admin/* here):
  // without a basePath, this app's own /_next/static/* asset URLs collide
  // with apps/main's, and the browser loads the wrong app's JS chunks.
  // https://nextjs.org/docs/app/guides/multi-zones
  basePath: "/admin",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: ["@korfbaltools/types", "@korfbaltools/config", "@korfbaltools/ui"],
};

export default nextConfig;
