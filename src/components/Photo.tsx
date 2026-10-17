import Image from "next/image";
import { photo } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import styles from "./Photo.module.css";

type Props = {
  slot: string;
  locale: Locale;
  sizes?: string;
  priority?: boolean;
  /** CSS aspect ratio for the frame, e.g. "4 / 5". Omit when the parent sets the size. */
  ratio?: string;
  className?: string;
  /** Decorative images get empty alt text. */
  decorative?: boolean;
};

export function Photo({ slot, locale, sizes = "100vw", priority, ratio, className, decorative }: Props) {
  const p = photo(slot);
  return (
    <div
      className={`${styles.frame} ${className ?? ""}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <Image
        src={p.src}
        alt={decorative ? "" : p.alt[locale]}
        fill
        sizes={sizes}
        priority={priority}
        quality={78}
        className={styles.img}
        style={{ objectPosition: `50% ${Math.round(p.focusY * 100)}%` }}
      />
    </div>
  );
}
