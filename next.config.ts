import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2400],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // Hero files are versioned by name (hero-v2-*), so browsers and the CDN may keep them for a year.
  // Ship a new loop under a new name (hero-v3-*) rather than overwriting these.
  async headers() {
    return [
      { source: "/video/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/photos/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
};

export default withNextIntl(nextConfig);
