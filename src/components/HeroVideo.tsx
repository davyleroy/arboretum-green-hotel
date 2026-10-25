"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PageHero.module.css";

export type HeroVideoSources = {
  /** H.264 4:2:0 MP4, plays everywhere. */
  src: string;
  srcSmall: string;
  /** Optional AV1 MP4s, about 40% lighter; used only where the browser says it can play them. */
  srcAv1?: string;
  srcSmallAv1?: string;
  poster: string;
  posterSmall?: string;
};
type Props = HeroVideoSources & { pauseLabel: string; playLabel: string };

/**
 * Inline boot script. It runs while the HTML is still being parsed, long before React hydrates,
 * so the video starts downloading on first load instead of waiting for the JavaScript bundle.
 * It skips the video for reduced motion, Save-Data and 2g, picks the small file on narrow screens
 * and AV1 where supported, and reveals the video only once frames are actually playing.
 */
const BOOT = `(function(v){try{
var c=navigator.connection||{};
if(matchMedia("(prefers-reduced-motion: reduce)").matches||c.saveData||/(^|-)2g$/.test(c.effectiveType||""))return;
var s=matchMedia("(max-width: 900px)").matches,d=v.dataset,
a=v.canPlayType('video/mp4; codecs="av01.0.05M.08"')==="probably";
var u=s?(a&&d.av1s)||d.s:(a&&d.av1)||d.l;if(!u)return;
v.addEventListener("playing",function(){v.setAttribute("data-on","1");v.dispatchEvent(new Event("heroready"))},{once:true});
v.src=u;var p=v.play();p&&p.catch&&p.catch(function(){});
}catch(e){}})(document.currentScript.previousElementSibling)`;

/**
 * Silent background loop for the homepage hero.
 * The poster is a normal high-priority image, so the page never waits on the video.
 * A pause control appears once the loop is running (WCAG 2.2.2).
 */
export function HeroVideo({ src, srcSmall, srcAv1, srcSmallAv1, poster, posterSmall, pauseLabel, playLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (v.dataset.on) setReady(true);
    const on = () => setReady(true);
    v.addEventListener("heroready", on);
    return () => v.removeEventListener("heroready", on);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <>
      <picture>
        {posterSmall && <source media="(max-width: 900px)" srcSet={posterSmall} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className={styles.media} fetchPriority="high" decoding="async" />
      </picture>
      <video
        ref={ref}
        className={styles.video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        data-l={src}
        data-s={srcSmall}
        data-av1={srcAv1}
        data-av1s={srcSmallAv1}
        suppressHydrationWarning
      />
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      {ready && (
        <button type="button" className={styles.pause} onClick={toggle} aria-pressed={!playing}>
          {playing ? pauseLabel : playLabel}
        </button>
      )}
    </>
  );
}
