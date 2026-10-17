import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Gallery, type GalleryItem } from "@/components/Gallery";
import { photo } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("gallery") };
}

const PICKS: [string, GalleryItem["mood"]][] = [
  ["home-day", "morning"],
  ["room-deluxe-1", "morning"],
  ["coffee-latte", "morning"],
  ["grounds-cottages", "morning"],
  ["room-signature-1", "evening"],
  ["dine-table", "table"],
  ["coffee-pour", "morning"],
  ["grounds-evening", "evening"],
  ["dine-booths", "table"],
  ["room-garden-2", "evening"],
  ["bar-counter", "evening"],
  ["detail-bath", "morning"],
  ["dine-daylight", "table"],
  ["meet-banquet", "table"],
  ["room-classic-1", "evening"],
  ["dine-room-2", "evening"],
  ["grounds-terrace", "morning"],
  ["coffee-grinder", "morning"],
  ["dine-chairs", "table"],
  ["bar-lounge", "evening"],
  ["room-signature-2", "morning"],
  ["grounds-entrance", "morning"],
  ["reception", "morning"],
  ["home-hero-night", "evening"],
];

export default async function GalleryPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("gallery");
  const items: GalleryItem[] = PICKS.map(([slot, mood]) => {
    const p = photo(slot);
    return { slot, src: p.src, alt: p.alt[locale], width: p.width, height: p.height, mood };
  });

  return (
    <>
      <PageHero slot="grounds-terrace" locale={locale} eyebrow={t("eyebrow")} title={t("title")} />
      <section className="section">
        <div className="wrap">
          <Gallery items={items} />
        </div>
      </section>
    </>
  );
}
