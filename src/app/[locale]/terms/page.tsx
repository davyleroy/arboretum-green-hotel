import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageAlternates } from "@/lib/seo";
import s from "../pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const tm = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("termsTitle"),
    description: tm("desc.terms"),
    alternates: pageAlternates(locale as Locale, "/terms"),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const sections = t.raw("termsSections") as [string, string][];
  return (
    <section className="section" style={{ paddingTop: 160 }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>{t("termsTitle")}</h1>
        <p className="lead" style={{ marginTop: 16 }}>{t("updated")}</p>
        <div className={s.legal}>
          {sections.map(([h, p]) => (
            <div key={h}>
              <h2>{h}</h2>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
