# Arboretum Green Hotel website: brief for the coding agent

Read this file in full before you change anything. It is the single source of truth for what this
project is, how it is built, what is already done, and what has to happen, in what order, before the
public unveiling at **08:00 on Sunday 15 November 2026**.

- Client: Arboretum Green Hotel, Huye (Butare), Southern Province, Rwanda. Opened 1 October 2026.
- Delivered by: Tenex (Davy Mbuto, co-founder and business development). Davy is your only source of instructions.
- Repository: `github.com/davyleroy/arboretum-green-hotel`, branch `main`.
- Live demo: `https://arboretum-green.vercel.app` (Vercel project `prj_12HKQaOmR5t5Uy6vdcQsNIiZgHGB`).
- Brief written: Sunday 25 October 2026, at the end of week 1.

---

## 1. Hard deadlines

| Date | What must be true |
| --- | --- |
| Fri 30 Oct | Owners decide the domain plan (section 9.1). |
| Mon 2 Nov | Owners deliver menus, logo source file and the real room types and rates. |
| Fri 6 Nov | Owners sign off all copy in EN, RW and FR. |
| **Fri 13 Nov, end of day** | **Launch-ready.** Production mode on, domain live, every check in section 11 green. Code freeze. |
| Sat 14 Nov | Davy runs his own tests and audits. Only fixes he asks for, nothing else. |
| Sun 15 Nov, 08:00 | Unveiling to the owners. |

If something on the critical path slips, tell Davy the same day with the impact and the option you
recommend. Do not quietly cut scope.

---

## 2. Rules you must follow (non-negotiable)

1. **Secrets.** Never create accounts, never type or paste passwords, API keys or tokens anywhere, never
   commit them, never print them in logs or chat. Davy adds every secret himself in the Vercel dashboard.
   If a task needs a secret, stop and write down exactly which variable he must add and where.
2. **The hotel owns every account.** Sanity, Google Business Profile, Booking.com, Expedia, Resend, the domain
   and DNS: each is created by the hotel (or Davy acting for them) in the hotel's name. Tenex is invited
   as a manager or editor. Never set anything up under a personal or Tenex-owned account.
3. **Placeholders stay marked until confirmed.** Any fact the hotel has not confirmed in writing keeps
   `"placeholder": true` and renders with the dotted brass `<Ph>` marker. Never invent a price, a time, a
   capacity or a distance. Confirmed facts are listed in section 8.
4. **Photography.** Only the HAGY Images Studio shoot (October 2026) in `public/photos/arboretum/`. No stock
   photos, no Kenlo photos (removed for good), **no people visible in any image**, no third-party advertising
   (the roadside billboard, beer-brand fridges). The build gate enforces part of this (section 5.4).
5. **Writing style.** Never use em-dashes in any copy, commit message or document. Use a comma, a colon, a
   full stop or brackets. Tone is "silent elegance": short, calm, concrete, no superlatives, no exclamation marks.
6. **Three languages, always together.** Every user-facing string exists in `en`, `rw` and `fr`. Never ship a
   key in one language only. Kinyarwanda and French drafts are marked for native review (section 9.6).
7. **Accessibility and performance are release blockers**, not nice-to-haves (section 6).
8. **Small, reviewable commits on `main`**, each one building cleanly. Use a branch only for experiments.
   End every commit message with the attribution lines Davy's tooling asks for.
9. **Ask before anything irreversible**: DNS changes, deleting content in Sanity, switching `SITE_MODE` to
   `production`, removing a page, or changing a URL that might already be shared.

---

## 3. Stack and versions

| Piece | Version / choice |
| --- | --- |
| Framework | Next.js **15.5.28**, App Router, React **19.1.0**, TypeScript |
| i18n | next-intl 4, locales `en` (default), `rw`, `fr`, `localePrefix: "always"` |
| Rendering | Static generation for every page; one dynamic route `/api/enquiry` |
| Styling | CSS Modules plus global tokens in `src/app/globals.css` (no Tailwind) |
| Fonts | `@fontsource/cormorant-garamond` (display), `@fontsource/jost` (text), self-hosted |
| CMS | Sanity: `sanity@3.99.0`, `next-sanity@9.12.3`, `@sanity/client@6.29.1`, `styled-components@6.1.19`, Studio embedded at `/studio` |
| Email | Resend through `/api/enquiry` (demo mode when no key) |
| Analytics | `@vercel/analytics` (`<Analytics />` in the locale layout) |
| Hosting | Vercel, Git integration on `main` |
| QA | Playwright 1.64.1 and axe-core 4.14.0 (dev dependencies) |

Do not upgrade major versions before launch. Patch upgrades only if they fix a security advisory.

---

## 4. Repository map

```
content/                 hotel facts (JSON), written by the CMS sync at build time
  site.json              contact, hero media, maps, policies, check-in/out, opening date
  rooms.json             room types (to be replaced with the real types, section 9.2)
  dining.json            restaurant, coffee counter, bar
  venue.json             conference hall, capacities, what is included
  discover.json          places around Huye
  photo-manifest.json    every photo slot: file, source frame, size, alt text EN/FR/RW
messages/{en,rw,fr}.json interface and page copy
public/photos/arboretum/ 40 graded photos (2400 px long side)
public/video/            hero-v2-1600(.av1).mp4 desktop, hero-v2-960(.av1).mp4 mobile, two posters (section 5.3)
public/brand/            logo set and touch icons
scripts/cms-sync.mjs     seed Sanity once, then pull published content into content/*.json
scripts/check-photos.mjs photo gate (fails production builds with missing photos)
scripts/qa/              a11y.mjs, shots.mjs, booking-ref.mjs (section 11)
src/app/[locale]/        page.tsx (home), stay, dine, meet, discover, gallery, contact, privacy, terms
src/app/api/enquiry/     enquiry endpoint
src/app/studio/          Sanity Studio route (its own layout)
src/components/          BookButton, BookSheet, EnquiryForm, Footer, Gallery, Header, HeroVideo, HomeView,
                         Icons, PageHero, Ph, Photo, Reveal, SourceTracker
src/lib/content.ts       the only module pages read content through
src/lib/source.ts        booking-source capture and references
src/lib/seo.ts           JSON-LD (Hotel schema, hasMap, image)
src/sanity/              env.ts, schemas/ (locale, site, collections, index)
sanity.config.ts         Studio config, basePath /studio, custom structure
src/middleware.ts        locale routing; matcher excludes api, _next, _vercel, brand, photos, video, studio and files
```

---

## 5. How the system works

### 5.1 Pages and routes
Nine pages in each of three languages (27 static pages): `/{locale}`, `/stay`, `/dine`, `/meet`,
`/discover`, `/gallery`, `/contact`, `/privacy`, `/terms`. The root `/` redirects to `/en`. Every page uses
`setRequestLocale` and `getTranslations`; keep it that way so pages stay static.

### 5.2 Content flow
```
Sanity (published)  --build: scripts/cms-sync.mjs-->  content/*.json  --src/lib/content.ts-->  pages
```
- Pages never call Sanity at runtime. The public site is fully static, which matters on mobile data in Rwanda.
- With no `NEXT_PUBLIC_SANITY_PROJECT_ID`, the sync is a no-op and the committed JSON is used.
- First build with `SANITY_API_WRITE_TOKEN` and an empty dataset: the sync **seeds** Sanity from the JSON
  and uploads the photos and hero video, using `createIfNotExists` (safe to re-run).
- Every later build pulls published documents and maps them back to the JSON shape. Missing RW or FR
  falls back to EN.
- Publishing in the Studio calls a Sanity webhook, which calls a Vercel deploy hook. The change is live in
  about a minute.
- **If you add a field**, change it in all four places: the Sanity schema, the seed mapping, the pull mapping
  in `cms-sync.mjs`, and the JSON plus its reader in `content.ts`.

Placeholder facts have the shape `{ "value": ..., "placeholder": true }`. In Sanity the same idea is a
`toConfirm` boolean. `<Ph on={...}>` shows the marker; `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false` adds the
`ph-off` class to hide all markers.

### 5.3 Hero media (chosen: option B, the silent loop)
`site.heroMedia` decides what opens the homepage:
```json
{ "type": "video",
  "video": { "src": "/video/hero-v2-1600.mp4", "srcSmall": "/video/hero-v2-960.mp4",
             "srcAv1": "/video/hero-v2-1600.av1.mp4", "srcSmallAv1": "/video/hero-v2-960.av1.mp4",
             "poster": "/video/hero-v2-poster.jpg", "posterSmall": "/video/hero-v2-poster-960.jpg" },
  "imageSlot": "home-hero-night" }
```
- `type: "image"` shows the photo slot instead. Staff switch this in the Studio (Site settings, hero type),
  and can upload another video or poster there.
- `HeroVideo` paints the poster first (high-priority image, smaller file on phones). A tiny inline script
  placed right after the `<video>` picks the source while the HTML is still parsing, before React hydrates,
  so the download starts immediately on first load. It skips the video for `prefers-reduced-motion`,
  Save-Data and 2g, picks the 960 px file under 900 px wide, and AV1 where the browser supports it.
  The video stays invisible until its `playing` event, then fades in over the identical poster frame.
  A Pause/Play button appears once it plays (WCAG 2.2.2). Do not move this logic into `useEffect`:
  that delays the first frame by the whole JavaScript download.
- Files: H.264 High 4:2:0 (plays with hardware decoding everywhere) at 2.7 MB desktop and 1.3 MB mobile,
  AV1 at 1.6 MB and 0.8 MB. Keyframe every 2 s, `faststart`, colour grade baked in (no CSS filter on the
  video: a filter on a full-screen video forces a repaint on every frame). The file opens on the welcome
  sign, identical to the poster; the fade through forest green sits at the loop point, never at the start.
- `/video/*` is served with a one-year immutable cache, so a new loop must ship under a new name (`hero-v3-*`).
- The loop is about 19 s: 6 scenes, 0.45 s crossfades, no sound. Any replacement video must be muted,
  H.264 **4:2:0** (never 4:4:4), under 20 s, under 3 MB desktop and 1.5 MB mobile, open on a frame that matches
  its poster, and show no people and no third-party logos.

### 5.4 Photo gate
`scripts/check-photos.mjs` runs before every build. With `SITE_MODE=production` it fails if any slot in
`photo-manifest.json` has no `arboretum` file. All 40 slots are filled today. Any new slot needs its
graded file, its `arboretumSource` frame, its size and alt text in three languages.
Grading recipe (if you add frames): partial gray-world white balance (strength 0.35, or 0.12 for night),
highlight roll-off, saturation 0.86, contrast 1.02, 2400 px long side, JPEG quality around 82.
On screen the `Photo` component adds `saturate(0.94) contrast(1.02)`.

### 5.5 Booking references and source tracking
This is how the hotel (and Tenex's commission) will know which channel brought each booking. Do not break it.
- `captureSource()` runs on first load and keeps the **first-touch** source for 30 days in localStorage, from
  `?src=`, then `utm_source`, then the referrer.
- Codes: **D** direct, **G** Google search, **M** Google Maps or Business Profile, **I** Instagram,
  **F** Facebook, **T** TikTok, **B** booking platform, **Q** printed QR code, **R** other website.
- `SourceTracker` listens for clicks (capture phase) on any `a[href^='https://wa.me/']` and appends
  `Ref AG-<code>-XXXX` to the message just before WhatsApp opens. It rebuilds the URL with
  `encodeURIComponent` (never `+` for spaces).
- `EnquiryForm` sends `ref: bookingRef()`; the API validates `^AG-[A-Z]-[2-9A-Z]{4}$` and puts it in the
  email subject and body.
- Every new WhatsApp button must be a normal `<a href="https://wa.me/...">` so it gets stamped automatically.
- Channel links to hand out: Google profile `/?src=gmb`, Instagram bio `/?src=ig`, Facebook `/?src=fb`,
  TikTok `/?src=tiktok`, printed QR `/?src=qr`, booking platforms `/?src=booking`.

### 5.6 Enquiries
`POST /api/enquiry` validates input, then sends through Resend when `RESEND_API_KEY` and `ENQUIRY_TO` are set;
otherwise it logs and returns success (demo mode). The form always offers WhatsApp as the faster route.

### 5.7 Maps
Contact page embeds Google Maps centred on the hotel (`-2.6211, 29.7409`, plus code `9PHR+H9R`), place id
`0x19c30b007cd211e1:0x4ec0d2605d3974a3`. The iframe is lazy, has a title, and is greyscale until hover.

---

## 6. Design and quality bar

### 6.1 Visual language
- Palette: forest green (primary), brass (accents, placeholder marker), **window blue** (the light blue taken
  from the hotel's window frames, used sparingly as the "window" photo frame and secondary accent), warm
  off-white backgrounds, deep forest `#12241B` for night sections. All colours are tokens in `globals.css`;
  never hard-code a new colour in a module.
- Type: Cormorant Garamond for headings, Jost for text. Generous whitespace, few words, one call to action per block.
- Motion: gentle reveals only, all disabled under `prefers-reduced-motion`.

### 6.2 Accessibility (release blocker)
- axe-core WCAG 2 A and AA: **zero violations** on all 27 pages (`npm run qa:a11y`).
- Visible focus on every control, full keyboard use of the booking sheet and gallery, `lang` set per locale,
  alt text in the page language, contrast 4.5:1 for text.
- No horizontal scroll at 390 px (`npm run qa:shots` reports it).

### 6.3 Performance budgets (mobile, slow 4G, Lighthouse)
| Metric | Budget |
| --- | --- |
| Performance score | 90 or more on home, stay, contact |
| LCP | under 2.5 s (poster image is the LCP, keep it preloaded and under 250 KB) |
| CLS | under 0.05 |
| JS shipped to a public page | under 150 KB gzipped (the Studio bundle must never load outside `/studio`) |
| Hero video | not requested at all for reduced motion, Save-Data or 2g |

### 6.4 SEO
- Demo mode sends `noindex`. Production mode removes it. Only switch at launch (section 10, day 13 Nov).
- Each page must have a title and description in its language, `hreflang` alternates for en, rw, fr and `x-default`,
  a canonical URL from `NEXT_PUBLIC_SITE_URL`, Open Graph image, and the Hotel JSON-LD in `seo.ts`.
- Add `sitemap.ts` and `robots.ts` (section 9.5) before launch.

---

## 7. Environment variables

Davy sets these in Vercel himself. `.env.example` lists them for local work.

| Variable | Purpose | Status 25 Oct |
| --- | --- | --- |
| `SITE_MODE` | `demo` or `production` (indexing, photo gate) | `demo` until 13 Nov |
| `NEXT_PUBLIC_SITE_URL` | canonical and OG base URL | change to the final domain at cutover |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `false` hides markers | set `false` only once every fact is confirmed or removed |
| `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM` | enquiry email | waiting on Davy |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | CMS (not secret) | waiting on Davy |
| `SANITY_API_WRITE_TOKEN` | seed and pull (secret, Editor token) | waiting on Davy |

Also pending on Davy: enable Web Analytics in the Vercel dashboard, create the deploy hook and the Sanity
webhook (README, "One-time setup", steps 6 and 7), and move the Vercel project to a Pro plan before the
public launch (Hobby is for non-commercial use).

---

## 8. What is confirmed and what is not

Confirmed by the hotel (keep `placeholder: false`):
- Check-out 10:00. Restaurant and coffee 07:00 to 22:00. Bar closes 02:00.
- WhatsApp reply promise: reception answers day and night, usually within 10 minutes.
- Conference hall: theatre, classroom and banquet 100; boardroom 15. Microphones, whiteboard, flip chart,
  generator backup included.
- Policies: 50 % deposit to confirm, free cancellation up to 2 hours before arrival, rates in RWF or USD,
  breakfast included in some rooms (otherwise 5,000 RWF), day use from 15,000 RWF.
- Opening date 1 October 2026. Total rooms: 30.
- The name story: "Green, inside and out" (not linked to Ruhande Arboretum).

Still to confirm (keep marked, chase through Davy):
- **Room types and rates.** The form returned only one type ("Single", 21 units, 1 double bed, 2 guests,
  15,000 RWF) out of 30 rooms. The site still shows the demo types Classic, Deluxe, Garden.
- **Check-in time.** Site shows 14:00 "to confirm"; the form said 18:00, which is unusual. Confirm before launch.
- Bar opening time (closing 02:00 is confirmed).
- Conference hall prices (form said 200,000 RWF for both half and full day; confirm).
- Kibeho distance ("about an hour by road").
- Music licence for the hero video (ask HAGY Images Studio). The site loop is silent, but confirm the licence
  covers web use of the footage.
- Who controls the current booking system on `arboretumgreenhotel.rw` (the domain belongs to the manager).

---

## 9. Work packages

Each package lists the tasks and its **acceptance criteria**. A package is done only when every criterion is met
and the checks in section 11 pass.

### 9.1 Domain and booking-system plan (week 2, decision by 30 Oct)
The owners keep their existing booking system, which today lives on `arboretumgreenhotel.rw`.
Recommended plan to put to them:
- New site on the apex `arboretumgreenhotel.rw` and `www` (Vercel).
- Existing booking system moved to `book.arboretumgreenhotel.rw` (CNAME to wherever it is hosted).
- 301 redirects from any known old paths to the new pages, plus a "Book online" link to the subdomain.

Tasks:
1. Write `docs/DOMAIN_PLAN.md`: current DNS records (Davy pastes them), target records, the cutover order,
   rollback steps, and who at the hotel holds the registrar login.
2. Add the redirects in `next.config` once the old URL list is known.
3. Add the booking subdomain as a link in the header Book sheet and the footer, tracked as an outbound click.

Accept when: the plan is signed off by Davy; cutover steps can be done in under 30 minutes with TTL lowered
48 hours before; the booking system still works on its new address in a test.

### 9.2 Real room types (week 2, as soon as owners send them)
Tasks:
1. Replace the three demo rooms in `content/rooms.json` (and the Sanity documents, if seeded) with the real
   types: name EN/RW/FR, units, bed, guests, what is included, rate in RWF (and USD if given), photos.
2. Map each type to existing photo slots; if a type has no matching photos, tell Davy which shots are missing.
3. Show units only if the owners want it public (ask). Show "from" prices only if confirmed.

Accept when: the stay page lists exactly the hotel's types; every number is either confirmed or marked; the
booking sheet's room list matches; the 30-room total adds up.

### 9.3 CMS go-live (week 2, after Davy adds the Sanity variables)
Tasks:
1. After Davy's redeploy, confirm the seed ran (build log line from `cms-sync.mjs`) and that every document type
   opens in `/studio` with content, photos and the hero video.
2. Make a test edit in each type (a room summary, an outlet hour, a photo alt text, hero switch to image and back),
   publish, and confirm the change appears on the live site within about two minutes through the webhook.
3. Lock down: singletons for Site settings and Venue cannot be deleted or duplicated; required fields and
   validation (times as `HH:MM`, prices as numbers, alt text required in EN); helpful field descriptions written
   for hotel staff, not developers.
4. Write `docs/STAFF_GUIDE.md` (and a short PDF if Davy asks): sign in, change a price, change hours, swap the
   hero to a photo or new video, replace a photo with good alt text, what "to confirm" means, how long until it
   is live, who to call. Plain English with a French version; Kinyarwanda if the owners want it.

Accept when: an editor with no developer help can change a price and see it live; nothing in the Studio can
break the build (bad input is blocked by validation); the staff guide is reviewed by Davy.

### 9.4 Google Business Profile and booking platforms (week 2, in parallel)
The hotel creates and owns the accounts; you prepare everything they paste in.
Tasks:
1. `docs/listing-kit/` with one Markdown file per platform (Google Business Profile, Booking.com, Expedia):
   name, category, short and long description in EN and FR (RW for Google), address, plus code, coordinates,
   phone, WhatsApp, email, website link with the right `?src=` code, check-in and check-out, policies, amenity
   checklist, room types (from 9.2), and the photo order (use the 26-photo Google Maps set and the two clips
   under 30 s that Davy already has).
2. A "booking platform rate parity" note for the owners: direct rate never higher than the platforms.

Accept when: every field in each kit is filled or explicitly marked "owners to supply"; links carry the source
codes; no text claims anything unconfirmed.

### 9.5 Launch hardening (week 3)
Tasks:
1. `src/app/sitemap.ts` (all 27 URLs with `alternates.languages`) and `src/app/robots.ts` (disallow `/studio`
   and `/api`; disallow everything when `SITE_MODE !== "production"`).
2. Custom `not-found` page in three languages, styled like the site.
3. Security headers in `next.config`: `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`,
   `Permissions-Policy` (camera, microphone and geolocation off), a frame-ancestors rule, and a CSP that allows
   Google Maps frames, Vercel Analytics and Sanity on `/studio` only. Test that the map, analytics and Studio still work.
4. Rate-limit `/api/enquiry` (simple per-IP limit plus a honeypot field); reject bodies over 10 KB.
5. Lighthouse runs on home, stay, contact (mobile) and fix anything under budget (section 6.3).
6. Check the Studio route does not leak into public bundles (inspect build output).
7. Favicons, `manifest`, and OG images verified with a link-preview check on WhatsApp.

Accept when: all budgets in section 6 are met; security headers verified with `curl -I`; enquiry spam test is blocked.

### 9.6 Copy and translation review (week 3, sign-off by 6 Nov)
Tasks:
1. Export all user-facing copy (messages plus content JSON) to one review sheet per language, with key, EN text,
   translation and a comment column. Davy forwards it to native reviewers and the owners.
2. Apply corrections. Re-check there are no em-dashes and no placeholder facts left without markers.
3. Owners approve the privacy and terms pages (they are plain-language drafts, not legal advice; suggest a
   Rwandan lawyer reads them against Law No. 058/2021 on personal data).

Accept when: every key has an approved translation; owners sign off in writing (email or WhatsApp is fine).

### 9.7 Launch (Wed 11 Nov to Fri 13 Nov)
1. **Wed 11 Nov:** full QA run (section 11) on the Vercel preview with production variables. Owners' review session.
2. **Thu 12 Nov:** fixes from the review. Lower DNS TTL (should already be done 48 h before).
3. **Fri 13 Nov:**
   - Davy sets `SITE_MODE=production`, `NEXT_PUBLIC_SITE_URL=https://arboretumgreenhotel.rw` and
     `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false` (only if every remaining marker is resolved or the item removed).
   - DNS cutover per `docs/DOMAIN_PLAN.md`; booking system verified on `book.`.
   - Re-run every check on the real domain. Submit the sitemap in Google Search Console (owned by the hotel).
   - Update the Google Business Profile website link to `https://arboretumgreenhotel.rw/?src=gmb`.
   - Tag the release `v1.0.0` and freeze.
4. **Sat 14 Nov:** Davy's audit day. You fix only what he lists, one commit per fix, re-running checks.
5. **Sun 15 Nov 08:00:** unveiling. Keep a rollback ready (previous Vercel deployment promoted in one click).

---

## 10. Weekly plan at a glance

| Week | Dates | Focus | Exit criteria |
| --- | --- | --- | --- |
| 1 | 19 to 25 Oct | Hero loop, confirmed facts, booking refs, legal pages, analytics, CMS code | **Done** |
| 2 | 26 Oct to 1 Nov | 9.1 domain plan, 9.3 CMS go-live, 9.4 listing kits, 9.2 rooms as soon as data arrives | CMS live and tested; domain decided; kits ready |
| 3 | 2 to 8 Nov | 9.2 finish rooms and menus, 9.5 hardening, 9.6 translations, staff guide | Copy signed off 6 Nov; budgets met |
| 4 | 9 to 13 Nov | 9.7 QA, owners' review, production switch, cutover | Launch-ready Fri 13 Nov |

Post a short status note to Davy at the end of each working day: done, next, blocked (and on whom).

---

## 11. Commands and checks

```bash
npm install
npm run dev                          # http://localhost:3000 (redirects to /en)
npm run build                        # cms-sync, then photo gate, then next build
npm start -- -p 3100                 # serve the build for QA

# QA (against a running build; set CHROMIUM_PATH if Playwright's own browser is not installed)
BASE=http://localhost:3100 npm run qa:a11y     # axe WCAG 2 A/AA on 27 pages, exit 1 on any violation
BASE=http://localhost:3100 npm run qa:shots    # desktop and phone screenshots to qa-shots/, flags horizontal overflow
BASE=http://localhost:3100 npm run qa:ref      # WhatsApp link gets "Ref AG-M-xxxx" after ?src=gmb
SITE_MODE=production npm run check:photos      # photo gate in production mode
npm run lint
```

Before every push: `npm run build` succeeds, `qa:a11y` is clean, `qa:ref` passes.
Before launch, additionally: Lighthouse on mobile (section 6.3), a manual pass on a real Android phone over mobile
data, the booking sheet sending a WhatsApp in each language, an enquiry email received in the hotel inbox, the
Studio edit-to-live test, and the map loading on the contact page.

### Definition of done for any change
- Builds, lints, and passes the three QA scripts.
- Works in EN, RW and FR and at 390 px and 1440 px.
- No new unconfirmed fact without a marker; no em-dashes; no people in new images.
- README or the relevant `docs/` file updated if behaviour or setup changed.

---

## 12. After launch (not in scope before 15 November, do not start)

From the PRD roadmap, for planning only:
- Growth: monthly report from Vercel Analytics plus the booking-reference log (bookings by channel), seasonal
  pages for pilgrim groups visiting Kibeho (15 August and 28 November), events calendar for the hall.
- Direct booking engine with deposit payment (MTN MoMo, Airtel Money, card), linked to the booking system.
- AI assistants: a WhatsApp concierge that answers common questions from the CMS content and hands over to reception.
- Optional hotel-management services from Tenex.

Commercial terms between Tenex, the hotel and other vendors are handled by Davy. Do not write anything about
fees, commissions or third-party contracts into the repository.

---

## 13. Known risks

| Risk | Mitigation |
| --- | --- |
| Owners send room data late | Launch with confirmed types only; others say "ask us on WhatsApp" rather than show a guess. |
| Domain held by the manager personally | Get registrar access confirmed by 30 Oct; fall back to launching on the Vercel URL and cutting over after the unveiling. |
| Existing booking system breaks on move | Test it on `book.` before cutover; keep the old DNS records written down for rollback. |
| Kinyarwanda review not back in time | Ship EN and FR approved; RW pages keep the reviewed parts and mark the rest for review. Tell Davy. |
| CMS edits break layout (very long text) | Field length validation in schemas; QA screenshots after the staff test edits. |
| Slow mobile networks | Static pages, poster-first hero, no video on Save-Data or 2g, image sizes from `next/image`. |
