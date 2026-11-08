import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arboretum-green.vercel.app").replace(/\/$/, "");
const paths = ["", "/stay", "/dine", "/meet", "/discover", "/gallery", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) for (const path of paths) {
    entries.push({
      url: `${BASE}/${locale}${path}`,
      lastModified: now,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${BASE}/${l}${path}`])),
      },
    });
  }
  return entries;
}
