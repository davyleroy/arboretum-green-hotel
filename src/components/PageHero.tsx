import type { Locale } from "@/i18n/routing";
import { Photo } from "./Photo";
import { HeroVideo } from "./HeroVideo";
import styles from "./PageHero.module.css";

type Props = {
  slot: string;
  locale: Locale;
  eyebrow: string;
  title: string;
  text?: string;
  tall?: boolean;
  /** Video lab: silent looping background instead of the still photo. */
  video?: { src: string; srcSmall: string; poster: string; pauseLabel: string; playLabel: string };
  children?: React.ReactNode;
};

/** Full-bleed photographic opening for every page. Text sits low-left on a soft shade. */
export function PageHero({ slot, locale, eyebrow, title, text, tall, video, children }: Props) {
  return (
    <section className={`${styles.hero} ${tall ? styles.tall : ""} on-dark`}>
      {video ? (
        <div className={styles.photo}><HeroVideo {...video} /></div>
      ) : (
        <Photo slot={slot} locale={locale} priority sizes="100vw" className={styles.photo} />
      )}
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
