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
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: site.name,
    slogan: t(site.tagline, locale),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Huye–Tumba Road",
      addressLocality: "Huye",
      addressRegion: "Southern Province",
      addressCountry: "RW",
    },
    telephone: site.phones,
    hasMap: site.mapsPlace,
    image: "/photos/arboretum/home-hero-night.jpg",
    amenityFeature: ["Free Wi-Fi", "Restaurant", "Bar", "Parking", "Conference hall", "24-hour reception"].map(
      (name) => ({ "@type": "LocationFeatureSpecification", name, value: true }),
    ),
    availableLanguage: ["en", "rw", "fr"],
  };
}
