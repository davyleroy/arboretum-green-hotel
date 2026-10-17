"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";
import { openBook } from "./BookButton";
import styles from "./Header.module.css";

const NAV = ["stay", "dine", "meet", "discover", "gallery", "contact"] as const;
const HREF: Record<(typeof NAV)[number], string> = {
  stay: "/stay",
  dine: "/dine",
  meet: "/meet",
  discover: "/discover",
  gallery: "/gallery",
  contact: "/contact",
};

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("cta");
  const locale = useLocale();
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const state = open ? styles.isOpen : solid ? styles.isSolid : styles.isClear;

  return (
    <header className={`${styles.header} ${state}`}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="Arboretum Green Hotel, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/header-on-forest.svg" alt="" className={styles.logoLight} width={190} height={44} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/header-on-ivory.svg" alt="" className={styles.logoDark} width={190} height={44} />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV.map((k) => (
            <Link
              key={k}
              href={HREF[k]}
              className={styles.navLink}
              aria-current={pathname === HREF[k] ? "page" : undefined}
            >
              {t(k)}
            </Link>
          ))}
        </nav>

        <div className={styles.end}>
          <LangSwitch current={locale} pathname={pathname} label={t("language")} />
          <button type="button" className={styles.book} onClick={() => openBook({ kind: "stay" })} aria-haspopup="dialog">
            {tc("book")}
          </button>
          <button
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t("close") : t("menu")}</span>
            <span aria-hidden className={styles.burgerLines} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={styles.sheet} hidden={!open}>
        <nav aria-label="Main" className={styles.sheetNav}>
          <Link href="/" className={styles.sheetLink}>{t("home")}</Link>
          {NAV.map((k) => (
            <Link key={k} href={HREF[k]} className={styles.sheetLink} aria-current={pathname === HREF[k] ? "page" : undefined}>
              {t(k)}
            </Link>
          ))}
        </nav>
        <div className={styles.sheetFoot}>
          <LangSwitch current={locale} pathname={pathname} label={t("language")} />
        </div>
      </div>
    </header>
  );
}

function LangSwitch({ current, pathname, label }: { current: string; pathname: string; label: string }) {
  return (
    <ul className={styles.lang} aria-label={label}>
      {locales.map((l) => (
        <li key={l}>
          <Link
            href={pathname}
            locale={l}
            className={styles.langLink}
            aria-current={l === current ? "true" : undefined}
            hrefLang={l}
            lang={l}
          >
            {l.toUpperCase()}
          </Link>
        </li>
      ))}
    </ul>
  );
}
