# Arboretum Green Hotel · website (Phase 0 demo)

Seven-page hotel site in English, Kinyarwanda and French, built with Next.js 15 (App Router) and next-intl.
The full plan lives in the PRD & Roadmap doc.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000  → redirects to /en
npm run build        # runs the photo gate first, then builds 21 static pages
npm start
```

## How it is organised

| Path | What lives there |
| --- | --- |
| `content/*.json` | Hotel facts: site settings, rooms, venue, dining, places. Each file maps 1:1 to a Sanity document type for phase 2. |
| `content/photo-manifest.json` | Every photo slot, its alt text in EN/RW/FR, its Kenlo source and an empty `arboretum` field. |
| `messages/{en,rw,fr}.json` | Interface and page copy per language. |
| `src/lib/content.ts` | The only place pages read content from. Swap its internals for Sanity queries in phase 2; pages stay as they are. |
| `src/components/` | Header, Footer, PageHero, Photo, BookSheet, EnquiryForm, Gallery, Ph (placeholder marker). |
| `src/app/[locale]/` | Home, stay, dine, meet, discover, gallery, contact. |
| `src/app/api/enquiry` | Enquiry form endpoint (emails the hotel through Resend). |
| `public/brand/` | Redrawn logo set: lockups, header logos, mark, monogram, touch icons. |

## Placeholder facts

Any field with `"placeholder": true` renders with a dotted brass underline and a "To confirm with the hotel"
tooltip. Set the confirmed value and flip it to `false`. To hide all markers (for example for a clean
screenshot), set `NEXT_PUBLIC_SHOW_PLACEHOLDERS=false`.

## Photography

All 40 photo slots use the official Arboretum shoot by HAGY Images Studio (October 2026, 90 frames).
`content/photo-manifest.json` maps each slot to its source frame (`arboretumSource`) with EN/FR/RW alt text.

Files in `public/photos/arboretum/` are 2400 px on the long side with a house grade baked in:
a partial white balance that cools the studio's warm cast, softer highlights and slightly lower
saturation, so the photos sit with the forest, brass and window-blue palette. Night frames get a
lighter white balance so the lamps stay warm.

Frames deliberately not used on the site: the roadside billboard and beer-brand fridges (third-party
advertising), and the street shots with children walking past.

`npm run build` runs `scripts/check-photos.mjs`; with `SITE_MODE=production` it fails if any slot
lacks an Arboretum file. The Kenlo mock photos have been removed from the repository.

## Environment variables

| Variable | Needed for | Example |
| --- | --- | --- |
| `RESEND_API_KEY` | Sending enquiry emails. Without it the form works in demo mode (logs only). | `re_...` |
| `ENQUIRY_TO` | Inbox that receives enquiries | `arboretumgreenhotel@gmail.com` |
| `ENQUIRY_FROM` | Sender once a domain is verified in Resend | `Arboretum Website <web@arboretumgreenhotel.rw>` |
| `SITE_MODE` | `production` enables indexing and enforces the photo gate | `production` |
| `NEXT_PUBLIC_SITE_URL` | Canonical and Open Graph URLs | `https://arboretum-green.vercel.app` |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `false` hides the dotted markers | `false` |

## Deploy (Vercel)

Import the repo in Vercel, keep the defaults (Next.js preset), and add the variables above. The demo
deliberately sends `noindex`, so it stays out of search results until `SITE_MODE=production`.
Note: Vercel's free Hobby plan is for non-commercial use; move to Pro before the public launch.

## Quality bar already checked

- axe-core WCAG 2.0/2.1 AA: no violations across all pages in EN, RW and FR.
- No horizontal scroll at 390 px; keyboard focus rings on every control; reduced-motion respected.
- Booking sheet builds a WhatsApp message in the visitor's language with dates, guests and room.

Kinyarwanda and French copy still needs a native reviewer before soft launch (PRD risk register).
