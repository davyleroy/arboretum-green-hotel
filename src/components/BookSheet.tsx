"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BookKind } from "./BookButton";
import styles from "./BookSheet.module.css";

type Props = {
  rooms: { slug: string; name: string }[];
  whatsapp: string;
  phones: string[];
};

/** Local calendar date (not UTC), so Kigali guests never see yesterday after midnight. */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function BookSheet({ rooms, whatsapp, phones }: Props) {
  const t = useTranslations("book");
  const tc = useTranslations("cta");
  const ref = useRef<HTMLDialogElement>(null);
  const [kind, setKind] = useState<BookKind>("stay");
  const [room, setRoom] = useState("");
  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 864e5));
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<{ kind: BookKind; room?: string }>).detail;
      setKind(d.kind);
      setRoom(d.room ?? "");
      ref.current?.showModal();
    };
    window.addEventListener("ag:book", onOpen);
    return () => window.removeEventListener("ag:book", onOpen);
  }, []);

  const datesBad = kind === "stay" && checkOut <= checkIn;

  const message = () => {
    const lines: string[] = [];
    if (kind === "stay") {
      lines.push(t("msgStay"), t("msgDates", { in: checkIn, out: checkOut }), t("msgGuests", { n: guests }));
      const r = rooms.find((x) => x.slug === room);
      if (r) lines.push(t("msgRoom", { room: r.name }));
    } else {
      lines.push(kind === "dining" ? t("msgDining") : t("msgEvent"), `${checkIn}`, t("msgGuests", { n: guests }));
    }
    return lines.join("\n");
  };

  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message())}`;
  const title = kind === "stay" ? t("title") : kind === "dining" ? tc("reserveTable") : tc("requestQuote");
  const formType = kind === "stay" ? "stay" : kind === "dining" ? "dining" : "event";

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-labelledby="book-title"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 id="book-title" className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={() => ref.current?.close()}>
            <span className="sr-only">{t("close")}</span>
            <span aria-hidden>×</span>
          </button>
        </div>
        <p className={styles.intro}>{t("intro")}</p>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>{kind === "stay" ? t("checkIn") : t("date")}</span>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} />
          </label>
          {kind === "stay" && (
            <label className={styles.field}>
              <span>{t("checkOut")}</span>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                aria-invalid={datesBad || undefined}
                aria-describedby={datesBad ? "date-error" : undefined}
              />
            </label>
          )}
          <label className={styles.field}>
            <span>{t("guests")}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={kind === "event" ? 500 : 12}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
          {kind === "stay" && (
            <label className={styles.field}>
              <span>{t("room")}</span>
              <select value={room} onChange={(e) => setRoom(e.target.value)}>
                <option value="">{t("anyRoom")}</option>
                {rooms.map((r) => (
                  <option key={r.slug} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {datesBad && <p id="date-error" className={styles.error} role="alert">{t("dateError")}</p>}

        <a
          className={`btn ${styles.primary}`}
          href={datesBad ? undefined : waHref}
          aria-disabled={datesBad || undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WaIcon /> {t("viaWhatsapp")}
        </a>

        <div className={styles.alt}>
          <p className={styles.altLabel}>{t("orCall")}</p>
          <div className={styles.phones}>
            {phones.map((p) => (
              <a key={p} href={`tel:${p.replace(/\s+/g, "")}`} className={styles.phone}>{p}</a>
            ))}
          </div>
          <Link
            href={{ pathname: "/contact", query: { type: formType } }}
            className="textlink"
            onClick={() => ref.current?.close()}
          >
            {t("orForm")}
          </Link>
        </div>
      </div>
    </dialog>
  );
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.2L4 20z" strokeLinejoin="round" />
      <path d="M9 9.2c.3 1.7 1.9 3.6 3.9 4.4l1.2-1 1.6.8c-.2 1-1 1.7-2 1.6C10.9 14.7 8.6 12.4 8.3 9.6c-.1-1 .6-1.8 1.6-2l.8 1.6-1 1" strokeLinejoin="round" />
    </svg>
  );
}
