import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { BookButton } from "@/components/BookButton";
import { Ph } from "@/components/Ph";
import { getInEveryRoom, getRooms, getSite, t as tl } from "@/lib/content";
import s from "../pages.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("stay") };
}

export default async function Stay({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("stay");
  const tc = await getTranslations("cta");
  const tp = await getTranslations("ph");
  const site = getSite();

  return (
    <>
      <PageHero slot="room-deluxe-2" locale={locale} eyebrow={t("eyebrow")} title={t("title")} text={t("text")}>
        <BookButton>{tc("bookStay")}</BookButton>
      </PageHero>

      <section className="section">
        <div className="wrap">
          {getRooms().map((room, i) => (
            <article key={room.slug} id={room.slug} className={`${s.feature} ${i % 2 ? s.featureFlip : ""}`}>
              <div className={`${s.photos} reveal`}>
                {room.photos.map((slot, n) => (
                  <Photo key={slot} slot={slot} locale={locale} sizes={n === 0 ? "(max-width: 900px) 100vw, 36vw" : "(max-width: 900px) 50vw, 18vw"} />
                ))}
              </div>
              <div className={`${s.featureText} reveal`}>
                <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
                <h2>{tl(room.name, locale)}</h2>
                <p className="lead">{tl(room.summary, locale)}</p>
                <dl className={s.facts}>
                  <div>
                    <dt>{t("bed")}</dt>
                    <dd><Ph on={room.bed.placeholder}>{tl(room.bed.value, locale)}</Ph></dd>
                  </div>
                  <div>
                    <dt>{t("guests")}</dt>
                    <dd><Ph on={room.guests.placeholder}>{t("upTo", { n: room.guests.value })}</Ph></dd>
                  </div>
                  <div>
                    <dt>{t("from")}</dt>
                    <dd><Ph on={room.rate.placeholder}>{room.rate.value ? `RWF ${room.rate.value.toLocaleString("en")}` : tp("onRequest")}</Ph></dd>
                  </div>
                </dl>
                <BookButton room={room.slug} className="btn btn-ghost">{tc("askRoom")}</BookButton>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section mood-sage">
        <div className={`wrap ${s.split}`}>
          <div className="reveal">
            <p className="eyebrow">{t("everyRoom")}</p>
            <ul className={s.list}>
              {getInEveryRoom().map((item) => (
                <li key={item.en}>{tl(item, locale)}</li>
              ))}
            </ul>
            <p style={{ marginTop: 28, color: "var(--ink-600)" }}>
              <Ph on={site.checkIn.placeholder}>{t("checkTimes", { in: site.checkIn.value, out: site.checkOut.value })}</Ph>
            </p>
          </div>
          <div className={`${s.photos} reveal`}>
            <Photo slot="detail-bath" locale={locale} sizes="(max-width: 900px) 100vw, 30vw" />
            <Photo slot="detail-slippers" locale={locale} sizes="(max-width: 900px) 50vw, 15vw" />
            <Photo slot="detail-linen" locale={locale} sizes="(max-width: 900px) 50vw, 15vw" />
          </div>
        </div>
      </section>
    </>
  );
}
