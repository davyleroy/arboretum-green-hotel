"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PageHero.module.css";

type Props = { src: string; srcSmall: string; poster: string; pauseLabel: string; playLabel: string };

/**
 * Silent background loop for the hero (video lab).
 * The poster shows first and stays when the visitor prefers reduced motion or saves data,
 * so the page never depends on the video. A pause control satisfies WCAG 2.2.2.
 */
export function HeroVideo({ src, srcSmall, poster, pauseLabel, playLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!conn && (conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType ?? ""));
    setAllowed(!reduce && !slow);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" className={styles.media} />
      {allowed && (
        <video
          ref={ref}
          className={styles.media}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden
        >
          <source src={srcSmall} type="video/mp4" media="(max-width: 900px)" />
          <source src={src} type="video/mp4" />
        </video>
      )}
      {allowed && (
        <button type="button" className={styles.pause} onClick={toggle} aria-pressed={!playing}>
          {playing ? pauseLabel : playLabel}
        </button>
      )}
    </>
  );
}
