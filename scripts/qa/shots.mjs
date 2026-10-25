// Full-page screenshots at desktop and phone width, and a horizontal-overflow check.
// usage: BASE=http://localhost:3000 node scripts/qa/shots.mjs /en /en/stay ...   (writes to qa-shots/)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const BASE = process.env.BASE ?? "http://localhost:3000";
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/en", "/en/stay", "/en/dine", "/en/meet", "/en/discover", "/en/contact", "/rw", "/fr"];
mkdirSync("qa-shots", { recursive: true });
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const [name, viewport] of [["desk", { width: 1440, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } scrollTo(0, 0); });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `qa-shots/${name}${p.replaceAll("/", "_")}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, p, overflow > 0 ? `HORIZONTAL OVERFLOW ${overflow}px` : "ok");
  }
  await ctx.close();
}
await b.close();
