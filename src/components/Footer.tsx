import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getSite, mapsLink, telLink, t as tl, whatsappLink } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import { Ph } from "./Ph";
import styles from "./Footer.module.css";

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations("footer");
  const tlg = useTranslations("legal");
  const tn = useTranslations("nav");
  const tc = useTranslations("contact");
  const site = getSite();
  const year = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} mood-dark`}>
      <div className="wrap">
        <div className={styles.top}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/lockup-on-forest.svg" alt="Arboretum Green Hotel" className={styles.lockup} width={300} height={235} />
          <div className={styles.cols}>
            <div>
              <p className={styles.label}>{tc("address")}</p>
              <p className={styles.text}>{tl(site.address, locale)}</p>
              <a href={mapsLink()} className="textlink" target="_blank" rel="noopener noreferrer">{tc("directions")}</a>
            </div>
            <div>
              <p className={styles.label}>{tc("phones")}</p>
              {site.phones.map((p) => (
                <a key={p} href={telLink(p)} className={styles.phone}>{p}</a>
              ))}
              <a href={whatsappLink("")} className={styles.phone} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <p className={styles.small}><Ph on={site.email.placeholder}>{site.email.value}</Ph></p>
            </div>
            <nav aria-label="Footer">
              <p className={styles.label}>Arboretum</p>
              <ul className={styles.links}>
                {(["stay", "dine", "meet", "discover", "gallery", "contact"] as const).map((k) => (
                  <li key={k}><Link href={`/${k}`}>{tn(k)}</Link></li>
                ))}
              </ul>
            </nav>
            <div>
              <p className={styles.label}>{t("follow")}</p>
              <ul className={styles.links}>
                <li><a href={site.social.instagram.value} target="_blank" rel="noopener noreferrer"><Ph on={site.social.instagram.placeholder}>Instagram</Ph></a></li>
                <li><a href={site.social.facebook.value} target="_blank" rel="noopener noreferrer"><Ph on={site.social.facebook.placeholder}>Facebook</Ph></a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="hairline" />
        <div className={styles.bottom}>
          <p>
            {t("rights", { year })} · <Link href="/privacy">{tlg("privacy")}</Link> · <Link href="/terms">{tlg("terms")}</Link>
          </p>
          <p className={styles.preview}>{t("preview")}</p>
        </div>
      </div>
    </footer>
  );
}
