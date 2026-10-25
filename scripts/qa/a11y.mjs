// WCAG 2 A/AA audit with axe-core on every page in all three languages.
// usage: BASE=http://localhost:3000 node scripts/qa/a11y.mjs   (exit code 1 if any violation)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const BASE = process.env.BASE ?? "http://localhost:3000";
const axe = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const launch = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const b = await chromium.launch(launch);
const page = await b.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const pages = ["", "/stay", "/dine", "/meet", "/discover", "/gallery", "/contact", "/privacy", "/terms"];
let failures = 0;
for (const l of ["en", "rw", "fr"]) for (const p of pages) {
  const path = `/${l}${p}`;
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  await page.addScriptTag({ content: axe });
  const v = await page.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.impact} ${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`));
  failures += v.length;
  console.log(path, v.length ? "\n  " + v.join("\n  ") : "clean");
}
await b.close();
process.exit(failures ? 1 : 0);
