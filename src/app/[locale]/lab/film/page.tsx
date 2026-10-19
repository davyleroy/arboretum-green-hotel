import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HomeView } from "@/components/HomeView";

// Video lab: an experiment for comparison only. Not linked from the site, never indexed.
export const metadata: Metadata = { title: "Video lab", robots: { index: false, follow: false } };

export default async function Lab({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeView locale={locale} variant="film" />;
}
