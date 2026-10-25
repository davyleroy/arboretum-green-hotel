/**
 * Booking-source tracking (client side).
 *
 * The first visit records where the guest came from (?src=, utm_source, or the referrer),
 * kept for 30 days. Every WhatsApp message and web enquiry then carries a short reference
 * such as "Ref AG-G-7K2Q", so reception can log each booking against its channel.
 * Codes: D direct · G Google search · M Google Maps/Business Profile · I Instagram
 *        F Facebook · T TikTok · B booking platform · Q printed QR code · R other website
 */
const KEY = "ag_src";
const TTL = 30 * 24 * 3600 * 1000;

const PARAM_MAP: Record<string, string> = {
  google: "G", gmb: "M", maps: "M", gbp: "M", instagram: "I", ig: "I", facebook: "F", fb: "F",
  tiktok: "T", booking: "B", expedia: "B", airbnb: "B", qr: "Q", direct: "D",
};

function fromReferrer(ref: string): string {
  if (!ref) return "D";
  try {
    const host = new URL(ref).hostname;
    if (host === location.hostname) return "D";
    if (/maps\.google|google\.[a-z.]+\/maps/.test(ref) || host.startsWith("maps.")) return "M";
    if (host.includes("google.")) return "G";
    if (host.includes("instagram.")) return "I";
    if (host.includes("facebook.") || host === "l.facebook.com" || host === "lm.facebook.com") return "F";
    if (host.includes("tiktok.")) return "T";
    if (/booking\.com|expedia|airbnb/.test(host)) return "B";
    return "R";
  } catch {
    return "D";
  }
}

/** Call once on page load: keeps the first-touch source for 30 days. */
export function captureSource(): void {
  try {
    const q = new URLSearchParams(location.search);
    const param = (q.get("src") || q.get("utm_source") || "").toLowerCase();
    const fromParam = PARAM_MAP[param];
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as { c: string; t: number } | null;
    if (fromParam) {
      localStorage.setItem(KEY, JSON.stringify({ c: fromParam, t: Date.now() }));
    } else if (!saved || Date.now() - saved.t > TTL) {
      localStorage.setItem(KEY, JSON.stringify({ c: fromReferrer(document.referrer), t: Date.now() }));
    }
  } catch {
    /* storage blocked: the reference falls back to D */
  }
}

export function sourceCode(): string {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as { c: string } | null;
    return saved?.c ?? "D";
  } catch {
    return "D";
  }
}

/** A fresh reference for one booking request, e.g. AG-G-7K2Q. */
export function bookingRef(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `AG-${sourceCode()}-${id}`;
}
