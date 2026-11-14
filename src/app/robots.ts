import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://certifree.vedhamreddym.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/account", "/sync", "/admin"] }, sitemap: `${base}/sitemap.xml` };
}
