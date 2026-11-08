// Assert that every page has the correct absolute canonical and four hreflang alternates.
// Guards the Phase A §4.1 fix: a subpage inheriting the homepage canonical would get de-indexed.
// usage: BASE=http://localhost:3000 node scripts/qa/canonical.mjs
// BASE is the host to fetch from. SITE_URL (defaults to BASE) is what the canonical absolute
// URL should resolve to (comes from metadataBase, i.e. NEXT_PUBLIC_SITE_URL at build time).
// exit code 1 if any mismatch.
const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = (process.env.SITE_URL ?? BASE).replace(/\/$/, "");
const locales = ["en", "rw", "fr"];
const paths = ["", "/stay", "/dine", "/meet", "/discover", "/gallery", "/contact", "/privacy", "/terms"];

const linkRe = /<link\s+rel="(canonical|alternate)"[^>]*>/gi;
const attr = (s, name) => {
  const m = s.match(new RegExp(`${name}="([^"]+)"`, "i"));
  return m ? m[1] : null;
};

let failures = 0;
for (const locale of locales) for (const path of paths) {
  const url = `${BASE}/${locale}${path}`;
  const res = await fetch(url, { redirect: "manual" });
  if (!res.ok) { console.log(`FAIL ${url}: HTTP ${res.status}`); failures++; continue; }
  const html = await res.text();
  const links = [...html.matchAll(linkRe)].map((m) => m[0]);
  const canonical = links.find((l) => /rel="canonical"/i.test(l));
  const alternates = links.filter((l) => /rel="alternate"/i.test(l));
  const expectCanonical = `${SITE}/${locale}${path}`;
  const errs = [];
  const cHref = canonical && attr(canonical, "href");
  if (cHref !== expectCanonical) errs.push(`canonical: got "${cHref}" want "${expectCanonical}"`);
  const altMap = Object.fromEntries(alternates.map((a) => [attr(a, "hrefLang") ?? attr(a, "hreflang"), attr(a, "href")]));
  for (const l of locales) {
    const want = `${SITE}/${l}${path}`;
    if (altMap[l] !== want) errs.push(`alt ${l}: got "${altMap[l]}" want "${want}"`);
  }
  const wantDefault = `${SITE}/en${path}`;
  if (altMap["x-default"] !== wantDefault) errs.push(`x-default: got "${altMap["x-default"]}" want "${wantDefault}"`);
  if (errs.length) { console.log(`FAIL ${locale}${path || "/"}\n  ${errs.join("\n  ")}`); failures += errs.length; }
  else console.log(`ok ${locale}${path || "/"}`);
}
console.log(failures ? `\n${failures} failure(s)` : "\nall 27 pages clean");
process.exit(failures ? 1 : 0);
