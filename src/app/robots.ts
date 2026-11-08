import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arboretum-green.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_MODE === "production") {
    return {
      rules: [{ userAgent: "*", allow: "/", disallow: ["/studio", "/api"] }],
      sitemap: `${BASE}/sitemap.xml`,
    };
  }
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
