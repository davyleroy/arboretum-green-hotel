import { getSite, t } from "./content";
import { locales, type Locale } from "@/i18n/routing";

/**
 * Per-page canonical and hreflang. Each page's generateMetadata must call this so Google does
 * not inherit the homepage canonical for subpages (which would de-index them).
 */
export function pageAlternates(locale: Locale, path: string) {
  const p = path.startsWith("/") || path === "" ? path : `/${path}`;
  return {
    canonical: `/${locale}${p}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${p}`])),
      "x-default": `/en${p}`,
    },
  };
}

/** schema.org Hotel markup (PRD R13). Unconfirmed facts are left out rather than guessed. */
export function hotelJsonLd(locale: Locale) {
  const site = getSite();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arboretum-green.vercel.app").replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "@id": `${base}/#hotel`,
    url: base,
    name: site.name,
    slogan: t(site.tagline, locale),
    ...(site.email.placeholder ? {} : { email: site.email.value }),
    telephone: site.phones,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Huye–Tumba Road",
      addressLocality: "Huye",
      addressRegion: "Southern Province",
      addressCountry: "RW",
    },
    geo: { "@type": "GeoCoordinates", latitude: -2.6211, longitude: 29.7409 },
    hasMap: site.mapsPlace,
    image: `${base}/photos/arboretum/home-hero-night.jpg`,
    // checkinTime is a placeholder in content/site.json; add it once the owner confirms the time.
    ...(site.checkOut.placeholder ? {} : { checkoutTime: site.checkOut.value }),
    amenityFeature: ["Free Wi-Fi", "Restaurant", "Bar", "Parking", "Conference hall", "24-hour reception"].map(
      (name) => ({ "@type": "LocationFeatureSpecification", name, value: true }),
    ),
    availableLanguage: ["en", "rw", "fr"],
  };
}
