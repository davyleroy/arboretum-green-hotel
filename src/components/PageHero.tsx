import type { Locale } from "@/i18n/routing";
import { Photo } from "./Photo";
import styles from "./PageHero.module.css";

type Props = {
  slot: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  text?: string;
  tall?: boolean;
  children?: React.ReactNode;
};

/** Full-bleed photographic opening for every page. Text sits low-left on a soft shade. */
export function PageHero({ slot, locale, eyebrow, title, text, tall, children }: Props) {
  return (
    <section className={`${styles.hero} ${tall ? styles.tall : ""} on-dark`}>
      <Photo slot={slot} locale={locale} priority sizes="100vw" className={styles.photo} />
      <div className={styles.shade} aria-hidden />
      <div className={`wrap ${styles.content}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {text && <p className={styles.text}>{text}</p>}
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </section>
  );
}
