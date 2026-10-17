// Release gate: a production build must not ship any Kenlo placeholder photo.
// Set SITE_MODE=production for the public launch build. Demo builds only warn.
import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync(new URL("../content/photo-manifest.json", import.meta.url), "utf8"),
);
const pending = Object.entries(manifest.slots).filter(([, s]) => !s.arboretum);
const mode = process.env.SITE_MODE ?? "demo";

if (pending.length === 0) {
  console.log("Photo gate: every slot has official Arboretum photography.");
} else if (mode === "production") {
  console.error(
    `Photo gate FAILED: ${pending.length} slot(s) still use Kenlo placeholders:\n` +
      pending.map(([k, s]) => `  - ${k} (${s.kenloSource})`).join("\n"),
  );
  process.exit(1);
} else {
  console.warn(
    `Photo gate (demo mode): ${pending.length} placeholder slot(s). ` +
      "A SITE_MODE=production build will refuse to ship these.",
  );
}
