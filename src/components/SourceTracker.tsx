"use client";

import { useEffect } from "react";
import { bookingRef, captureSource } from "@/lib/source";

/**
 * Records the visitor's source and stamps every WhatsApp link with a booking reference
 * at the moment it is clicked, so all WhatsApp buttons on the site are tracked the same way.
 */
export function SourceTracker() {
  useEffect(() => {
    captureSource();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='https://wa.me/']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href);
      const text = url.searchParams.get("text") ?? "";
      if (/Ref AG-/.test(text)) return;
      // Rebuild with %20 rather than "+" so every WhatsApp client shows spaces correctly
      const stamped = `${text}${text ? "\n" : ""}Ref ${bookingRef()}`;
      a.href = `${url.origin}${url.pathname}?text=${encodeURIComponent(stamped)}`;
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
