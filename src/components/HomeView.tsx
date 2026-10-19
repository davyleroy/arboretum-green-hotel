import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { BookButton } from "@/components/BookButton";
import { FilmButton } from "@/components/FilmButton";
import { Arrow, icons } from "@/components/Icons";
import { getSite, telLink, whatsappLink } from "@/lib/content";
import { hotelJsonLd } from "@/lib/seo";
import s from "@/app/[locale]/home.module.css";

const DOORS = [
  { key: "stay", href: "/stay", slot: "room-deluxe-1" },
  { key: "dine", href: "/dine", slot: "dine-table" },
  { key: "meet", href: "/meet", slot: "meet-banquet" },
  { key: "discover", href: "/discover", slot: "home-garden" },
] as const;

const AMENITIES = ["rooms", "restaurant", "coffee", "hall", "wifi", "parking", "reception", "garden"] as const;

export type HomeVariant = "photo" | "loop" | "film";

export async function HomeView({ locale, variant }: { locale: Locale; variant: HomeVariant }) {
  const t = await getTranslations("home");
  const tc = await getTranslations("cta");
  const tn = await getTranslations("nav");
  const tl = await getTranslations("lab");
  const site = getSite();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd(locale)) }} />

      <PageHero
        slot="home-hero-night"
        locale={locale}
        eyebrow={t("place")}
        title={t("heroTitle")}
        text={t("heroText")}
        tall
        video={variant === "loop" ? { src: "/video/hero-loop.mp4", srcSmall: "/video/hero-loop-960.mp4", poster: "/video/hero-poster.jpg", pauseLabel: tl("pause"), playLabel: tl("play") } : undefined}
      >
        <BookButton>{tc("bookStay")}</BookButton>
        {variant === "film" ? (
          <FilmButton label={tl("watch")} title={tl("filmTitle")} close={tl("close")} src="/video/film-1min.mp4" poster="/video/film-poster.jpg" />
        ) : (
          <Link href="/stay" className="textlink">{tc("exploreRooms")}</Link>
        )}
      </PageHero>

      {/* Welcome */}
      <section className="section">
        <div className={`wrap ${s.intro}`}>
          <div className={`reveal ${s.introText}`}>
            <p className="eyebrow">{t("introEyebrow")}</p>
            <h2>{t("introTitle")}</h2>
            <p className="lead" style={{ marginTop: 28 }}>{t("introText")}</p>
          </div>
          <Photo slot="home-day" locale={locale} ratio="4 / 5" sizes="(max-width: 900px) 100vw, 42vw" className={`reveal window ${s.introPhoto}`} />
        </div>
      </section>

      {/* Four doors */}
      <section className="section mood-sage">
        <div className="wrap">
          <p className="eyebrow reveal">{t("doorsEyebrow")}</p>
          <ul className={s.doors}>
            {DOORS.map((d, i) => (
              <li key={d.key} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <Link href={d.href} className={s.door}>
                  <Photo slot={d.slot} locale={locale} ratio="4 / 5" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw" decorative />
                  <span className={s.doorBody}>
                    <span className={s.doorTitle}>{tn(d.key)}</span>
                    <span className={s.doorText}>{t(`doors.${d.key}`)}</span>
                    <span className={s.doorArrow}><Arrow /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Night garden */}
      <section className={`mood-dark ${s.evening}`}>
        <Photo slot="dine-booths" locale={locale} sizes="(max-width: 900px) 100vw, 58vw" className={s.eveningPhoto} />
        <div className={`reveal ${s.eveningText}`}>
          <p className="eyebrow">{t("eveningEyebrow")}</p>
          <h2>{t("eveningTitle")}</h2>
          <p className="lead" style={{ marginTop: 24 }}>{t("eveningText")}</p>
          <Link href="/dine" className="textlink" style={{ marginTop: 16 }}>{tc("explore")} · {tn("dine")}</Link>
        </div>
      </section>

      {/* Amenities */}
      <section className="section mood-sky">
        <div className="wrap">
          <p className="eyebrow reveal">{t("amenitiesEyebrow")}</p>
          <ul className={s.amenities}>
            {AMENITIES.map((a) => (
              <li key={a} className="reveal">
                <span className={s.icon}>{icons[a]}</span>
                <span>{t(`amenities.${a}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reach us */}
      <section className="section mood-forest">
        <div className={`wrap ${s.reach}`}>
          <div className="reveal">
            <p className="eyebrow">{t("contactEyebrow")}</p>
            <h2>{t("contactTitle")}</h2>
            <p className="lead" style={{ marginTop: 24 }}>{t("contactText")}</p>
          </div>
          <div className={`reveal ${s.reachActions}`}>
            <a className="btn" href={whatsappLink("")} target="_blank" rel="noopener noreferrer">{tc("whatsapp")}</a>
            {site.phones.map((p) => (
              <a key={p} href={telLink(p)} className={s.reachPhone}>{p}</a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
