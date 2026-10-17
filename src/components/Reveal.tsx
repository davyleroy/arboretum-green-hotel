"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/** Fades .reveal elements in as they scroll into view. Without JS, everything stays visible. */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("js-reveal");
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
