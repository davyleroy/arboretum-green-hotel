import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { BookButton } from "@/components/BookButton";
import { Ph } from "@/components/Ph";
import { Link } from "@/i18n/navigation";
import { getVenue, t as tl } from "@/lib/content";
import s from "../pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("meet") };
}

export default async function Meet({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("meet");
  const tc = await getTranslations("cta");
  const venue = getVenue();

  return (
    <>
      <PageHero slot="meet-banquet" locale={locale} eyebrow={t("eyebrow")} title={t("title")} text={t("text")}>
        <BookButton kind="event">{tc("requestQuote")}</BookButton>
      </PageHero>

      <section className="section">
        <div className={`wrap ${s.split}`}>
          <div className="reveal">
            <p className="eyebrow">{t("capacityTitle")}</p>
            <table className={s.table}>
              <thead>
                <tr><th scope="col">{t("layout")}</th><th scope="col">{t("people")}</th></tr>
              </thead>
              <tbody>
                {venue.capacities.map((c) => (
                  <tr key={c.layout.en}>
                    <td>{tl(c.layout, locale)}</td>
                    <td><Ph on={c.people.placeholder}>{c.people.value}</Ph></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="reveal">
            <p className="eyebrow">{t("includedTitle")}</p>
            <ul className={s.list} style={{ gridTemplateColumns: "1fr" }}>
              {venue.included.map((item) => (
                <li key={item.en}>{tl(item, locale)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mood-dark">
        <div className={s.feature} style={{ gap: 0 }}>
          <Photo slot="meet-hall" locale={locale} ratio="5 / 4" sizes="(max-width: 900px) 100vw, 55vw" />
          <div className="reveal" style={{ padding: "var(--section) var(--gutter)" }}>
            <p className="eyebrow">{t("occasionsTitle")}</p>
            <ul className={s.list} style={{ gridTemplateColumns: "1fr" }}>
              {venue.occasions.map((o) => (
                <li key={o.en}>{tl(o, locale)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section mood-sage">
        <div className={`wrap ${s.introBlock}`}>
          <div className="reveal">
            <p className="eyebrow">{tc("requestQuote")}</p>
            <h2>{t("quoteTitle")}</h2>
          </div>
          <div className="reveal">
            <p className="lead">{t("quoteText")}</p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginTop: 24 }}>
              <BookButton kind="event">{tc("whatsapp")}</BookButton>
              <Link href={{ pathname: "/contact", query: { type: "event" } }} className="textlink">{tc("requestQuote")}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
