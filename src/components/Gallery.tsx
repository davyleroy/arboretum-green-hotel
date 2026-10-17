"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Gallery.module.css";

export type GalleryItem = {
  slot: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  mood: "morning" | "table" | "evening";
};

const MOODS = ["all", "morning", "table", "evening"] as const;

export function Gallery({ items }: { items: GalleryItem[] }) {
  const t = useTranslations("gallery");
  const [mood, setMood] = useState<(typeof MOODS)[number]>("all");
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = mood === "all" ? items : items.filter((i) => i.mood === mood);

  useEffect(() => {
    if (open === null) dialog.current?.close();
    else if (!dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open !== null ? shown[open] : null;

  return (
    <>
      <div className={styles.filters} role="group" aria-label={t("title")}>
        {MOODS.map((m) => (
          <button key={m} type="button" className={styles.filter} aria-pressed={mood === m} onClick={() => setMood(m)}>
            {t(m)}
          </button>
        ))}
      </div>

      <ul className={styles.grid}>
        {shown.map((item, i) => (
          <li key={item.slot} className={styles.cell}>
            <button type="button" className={styles.thumb} onClick={() => setOpen(i)} aria-label={`${t("open")}: ${item.alt}`}>
              <Image
                src={item.src}
                alt=""
                width={item.width}
                height={item.height}
                sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw"
                className={styles.img}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className={styles.lightbox}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && setOpen(null)}
        aria-label={current?.alt}
      >
        {current && (
          <figure className={styles.figure}>
            <div className={styles.stage}>
              <Image src={current.src} alt={current.alt} fill sizes="100vw" className={styles.full} />
            </div>
            <figcaption className={styles.caption}>{current.alt}</figcaption>
          </figure>
        )}
        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => step(-1)}>
          <span className="sr-only">{t("prev")}</span><span aria-hidden>‹</span>
        </button>
        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => step(1)}>
          <span className="sr-only">{t("next")}</span><span aria-hidden>›</span>
        </button>
        <button type="button" className={styles.close} onClick={() => setOpen(null)}>
          <span className="sr-only">{t("close")}</span><span aria-hidden>×</span>
        </button>
      </dialog>
    </>
  );
}
