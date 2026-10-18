import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { BookButton } from "@/components/BookButton";
import { Ph } from "@/components/Ph";
import { getPlaces, t as tl } from "@/lib/content";
import s from "../pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("discover") };
}

export default async function Discover({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("discover");
  const tc = await getTranslations("cta");

  return (
    <>
      <PageHero slot="home-garden" locale={locale} eyebrow={t("eyebrow")} title={t("title")} text={t("text")} />

      <section className="section mood-sky">
        <div className="wrap">
          <ul className={s.places}>
            {getPlaces().map((p) => (
              <li key={p.slug} className={`${s.place} reveal`}>
                <h3>{tl(p.name, locale)}</h3>
                <p>{tl(p.text, locale)}</p>
                <div className={s.placeMeta}>
                  <Ph on={p.distance.placeholder}>{tl(p.distance.value, locale)}</Ph>
                  {p.source && (
                    <>
                      <br />
                      <a href={p.source} target="_blank" rel="noopener noreferrer">{t("source")}</a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section mood-forest">
        <div className={`wrap ${s.split}`}>
          <div className="reveal" style={{ alignSelf: "center" }}>
            <p className="eyebrow">{t("nameTitle")}</p>
            <p className={s.quote}>{t("nameText")}</p>
            <div style={{ marginTop: 36 }}>
              <BookButton>{tc("planVisit")}</BookButton>
            </div>
          </div>
          <Photo slot="grounds-evening" locale={locale} ratio="4 / 5" sizes="(max-width: 900px) 100vw, 45vw" className="reveal" />
        </div>
      </section>
    </>
  );
}
