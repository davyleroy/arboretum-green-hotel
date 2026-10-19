import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { HomeView } from "@/components/HomeView";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeView locale={locale} variant="photo" />;
}
