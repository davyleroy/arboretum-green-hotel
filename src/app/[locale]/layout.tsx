import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookSheet } from "@/components/BookSheet";
import { Reveal } from "@/components/Reveal";
import { getRooms, getSite, t } from "@/lib/content";
import "../globals.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arboretum-green.vercel.app";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const tm = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: tm("title"), template: `%s · Arboretum Green Hotel` },
    description: tm("description"),
    icons: { icon: "/brand/monogram-forest.svg", apple: "/brand/apple-touch-icon.png" },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: tm("title"),
      description: tm("description"),
      images: ["/photos/arboretum/home-hero-night.jpg"],
      locale,
      type: "website",
    },
    // The demo is a private pitch; keep it out of search until the public launch.
    robots: process.env.SITE_MODE === "production" ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = { themeColor: "#12241b" };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const tn = await getTranslations({ locale, namespace: "nav" });
  const site = getSite();
  const rooms = getRooms().map((r) => ({ slug: r.slug, name: t(r.name, locale as Locale) }));
  const showPh = process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS !== "false";

  return (
    <html lang={locale} className={showPh ? undefined : "ph-off"}>
      <body>
        <NextIntlClientProvider>
          <a href="#main" className="skip">{tn("skip")}</a>
          <Header />
          <main id="main">{children}</main>
          <Footer locale={locale as Locale} />
          <BookSheet rooms={rooms} whatsapp={site.whatsapp} phones={site.phones} />
          <Reveal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
