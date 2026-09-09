import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Beheerpagina en PWA-fallback horen niet in de index.
      disallow: ["/api/", "/mijn-club", "/offline", "/niet-beschikbaar"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
