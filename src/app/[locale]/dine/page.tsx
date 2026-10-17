import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { BookButton } from "@/components/BookButton";
import { Ph } from "@/components/Ph";
import { getOutlets, t as tl } from "@/lib/content";
import s from "../pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("dine") };
}

export default async function Dine({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dine");
  const tc = await getTranslations("cta");

  return (
    <>
      <PageHero slot="dine-glasses" locale={locale} eyebrow={t("eyebrow")} title={t("title")} text={t("text")}>
        <BookButton kind="dining">{tc("reserveTable")}</BookButton>
      </PageHero>

      {getOutlets().map((o, i) => (
        <section key={o.slug} id={o.slug} className={`section ${o.slug === "bar" ? "mood-dark" : ""}`}>
          <div className={`wrap ${s.feature} ${i % 2 ? s.featureFlip : ""}`}>
            <div className={`${s.photos} reveal`}>
              {o.photos.map((slot, n) => (
                <Photo key={slot} slot={slot} locale={locale} sizes={n === 0 ? "(max-width: 900px) 100vw, 36vw" : "(max-width: 900px) 50vw, 18vw"} />
              ))}
            </div>
            <div className={`${s.featureText} reveal`}>
              <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
              <h2>{tl(o.name, locale)}</h2>
              <p className="lead">{tl(o.text, locale)}</p>
              <p className={s.hours}>
                <span className={s.hoursLabel}>{t("hours")}</span>
                <Ph on={o.hours.placeholder}>{o.hours.value}</Ph>
              </p>
              {o.slug === "restaurant" && <p style={{ color: "var(--ink-600)" }}><Ph>{t("menuNote")}</Ph></p>}
              <BookButton kind="dining" className={o.slug === "bar" ? "btn" : "btn btn-ghost"}>{tc("reserveTable")}</BookButton>
            </div>
          </div>
        </section>
      ))}

      <section className="section mood-sage">
        <div className={`wrap ${s.split}`}>
          <Photo slot="kitchen-pans" locale={locale} ratio="4 / 5" sizes="(max-width: 900px) 100vw, 45vw" className="reveal" />
          <div className="reveal" style={{ alignSelf: "center" }}>
            <p className="eyebrow">{t("kitchenTitle")}</p>
            <p className={s.quote}>{t("kitchenText")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
