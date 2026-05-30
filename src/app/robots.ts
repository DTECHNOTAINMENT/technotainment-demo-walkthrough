/**
 * robots.txt (docs/ROUTES.md "Public"). Allow crawling of public marketing/discovery
 * pages; disallow authed/staff surfaces and API. Points at the dynamic sitemap.
 */
import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/seo/meta";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/studio", "/api", "/search"],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
    host: appUrl(),
  };
}
