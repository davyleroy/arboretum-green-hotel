"use client";

import { useRef } from "react";
import styles from "./FilmButton.module.css";

type Props = { label: string; title: string; close: string; src: string; poster: string };

/** "Watch the hotel" link that opens the one-minute film in a quiet dialog, with sound and controls. */
export function FilmButton({ label, title, close, src, poster }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  const vid = useRef<HTMLVideoElement>(null);

  const open = () => {
    dlg.current?.showModal();
    vid.current?.play().catch(() => {});
  };
  const shut = () => {
    vid.current?.pause();
    dlg.current?.close();
  };

  return (
    <>
      <button type="button" className={`textlink ${styles.trigger}`} onClick={open}>
        <span className={styles.play} aria-hidden>▶</span>
        {label}
      </button>
      <dialog
        ref={dlg}
        className={styles.dialog}
        aria-label={title}
        onClose={() => vid.current?.pause()}
        onClick={(e) => { if (e.target === dlg.current) shut(); }}
      >
        <div className={styles.frame}>
          <video ref={vid} controls preload="none" playsInline poster={poster} className={styles.video}>
            <source src={src} type="video/mp4" />
          </video>
          <button type="button" className={styles.close} onClick={shut}>{close}</button>
        </div>
      </dialog>
    </>
  );
}
