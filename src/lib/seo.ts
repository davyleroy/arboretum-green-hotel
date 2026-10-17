import { getSite, t } from "./content";
import type { Locale } from "@/i18n/routing";

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
    image: "/photos/home-hero-night.jpg",
    amenityFeature: ["Free Wi-Fi", "Restaurant", "Bar", "Parking", "Conference hall", "24-hour reception"].map(
      (name) => ({ "@type": "LocationFeatureSpecification", name, value: true }),
    ),
    availableLanguage: ["en", "rw", "fr"],
  };
}
