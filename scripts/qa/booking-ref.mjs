// Checks that WhatsApp links get a booking reference with the right source code when clicked.
// usage: BASE=http://localhost:3000 node scripts/qa/booking-ref.mjs   (expects "Ref AG-M-xxxx")
import { chromium } from "playwright";
const BASE = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const p = await b.newPage();
await p.goto(`${BASE}/en?src=gmb`, { waitUntil: "networkidle" });
await p.goto(`${BASE}/en/contact`, { waitUntil: "networkidle" });
// stop the browser leaving the site, but let the site's own click handler stamp the link first
await p.evaluate(() => document.addEventListener("click", (e) => e.preventDefault()));
const a = p.locator("main a[href^='https://wa.me/']").first();
await a.click();
const text = new URL(await a.getAttribute("href")).searchParams.get("text") ?? "";
console.log(JSON.stringify(text));
await b.close();
const ok = /Ref AG-M-[2-9A-Z]{4}$/.test(text);
console.log(ok ? "booking reference OK" : "booking reference MISSING");
process.exit(ok ? 0 : 1);
