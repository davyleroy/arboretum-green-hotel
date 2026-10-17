import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Ph } from "@/components/Ph";
import { getSite, mapsLink, t as tl, telLink, whatsappLink } from "@/lib/content";
import s from "./contact.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("contact") };
}

export default async function Contact({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tc = await getTranslations("cta");
  const tb = await getTranslations("book");
  const site = getSite();
  const wa = whatsappLink(tb("msgStay"));

  return (
    <>
      <PageHero slot="reception" locale={locale} eyebrow={t("eyebrow")} title={t("title")} text={t("text")}>
        <a className="btn" href={wa} target="_blank" rel="noopener noreferrer">{tc("whatsapp")}</a>
      </PageHero>

      <section className="section">
        <div className={`wrap ${s.layout}`}>
          <aside className={s.details}>
            <div>
              <p className="eyebrow">{t("phones")}</p>
              {site.phones.map((p) => (
                <a key={p} href={telLink(p)} className={s.big}>{p}</a>
              ))}
              <p className={s.note}><Ph on={site.replyPromise.placeholder}>{tl(site.replyPromise.value, locale)}</Ph></p>
            </div>
            <div>
              <p className="eyebrow">WhatsApp</p>
              <a href={wa} className={s.big} target="_blank" rel="noopener noreferrer">+250 781 600 065</a>
            </div>
            <div>
              <p className="eyebrow">{t("email")}</p>
              <a href={`mailto:${site.email.value}`} className={s.mail}>{site.email.value}</a>
            </div>
            <div>
              <p className="eyebrow">{t("address")}</p>
              <p className={s.address}>{tl(site.address, locale)}</p>
              <a href={mapsLink()} className="textlink" target="_blank" rel="noopener noreferrer">{t("directions")}</a>
            </div>
          </aside>

          <div className={s.formCol}>
            <h2 className={s.formTitle}>{t("formTitle")}</h2>
            <p className="lead">{t("formText")}</p>
            <Suspense>
              <EnquiryForm whatsappHref={wa} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
