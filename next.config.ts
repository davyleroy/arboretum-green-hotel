import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP starts report-only; promoted to enforced on Fri 13 Nov once the console is clean
// on every page. 'unsafe-inline' for scripts is required because the pages are static
// and the hero boot script + Hotel JSON-LD are inline. Switching to nonces would make
// every page dynamic.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.googleapis.com https://*.gstatic.com https://*.google.com",
  "media-src 'self' https://cdn.sanity.io",
  "font-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "connect-src 'self'",
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Drop the "X-Powered-By: Next.js" fingerprint. Does not hide Next entirely (chunk
  // names, _next paths still reveal it) but removes the easy tell.
  poweredByHeader: false,
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
      // Common security headers for every route. HSTS is omitted here because Vercel already
      // sets it on the domain; adding includeSubDomains or preload would risk the booking
      // subdomain and is irreversible on short notice.
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Isolate the browsing context from cross-origin popups (Spectre + tabnabbing).
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Static assets can only be embedded by same-origin pages. COEP left off because it
          // would break the Google Maps iframe and Sanity CDN loads.
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          // Prevent the browser from leaking destination domains via DNS prefetch.
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
      // Stricter set for public pages: frame-ancestors none and CSP report-only.
      // Excludes /studio (Sanity Studio needs its own origins) and infra paths.
      {
        source: "/((?!studio|api|_next|_vercel|photos|video|brand).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
      // Studio: allow framing by self only, no CSP from us. Also keep Studio out of search
      // engines at the transport layer (belt and braces with the <meta> tag in page.tsx).
      {
        source: "/studio/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
        ],
      },
    ];
  },
  // Legacy URLs from the previous static site (Option B retirement, see docs/DOMAIN_PLAN.md).
  // Permanent 308s so OTA deep links, printed collateral, and old bookmarks continue to
  // resolve to the matching page on the new site after the Thu 12 Nov DNS cutover.
  // Also: canonicalise the Vercel preview host to the apex, but keep /studio reachable on
  // the vercel.app host as a backup editor entry.
  async redirects() {
    return [
      { source: "/about.html",    destination: "/en/discover",            permanent: true },
      { source: "/rooms.html",    destination: "/en/stay",                permanent: true },
      { source: "/services.html", destination: "/en/dine",                permanent: true },
      { source: "/discover.html", destination: "/en/discover",            permanent: true },
      { source: "/contact.html",  destination: "/en/contact",             permanent: true },
      { source: "/book.html",     destination: "/en/stay?src=book",       permanent: true },
      { source: "/feedback.html", destination: "/en/contact?type=feedback", permanent: true },
      {
        source: "/:path((?!studio).*)",
        has: [{ type: "host", value: "arboretum-green.vercel.app" }],
        destination: "https://arboretumgreenhotel.rw/:path",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
