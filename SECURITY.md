# Security policy

## Reporting a vulnerability

Please email **web@arboretumgreenhotel.rw** (primary) or open a private vulnerability report via the GitHub Security tab of this repository. Do not open a public issue for a security problem.

Please include:

- A short description of the vulnerability.
- Steps to reproduce (or a proof-of-concept URL / payload).
- The URL or route affected.
- Your contact details if you want a credit.

## What we cover

In scope:

- The production site at `https://arboretumgreenhotel.rw` and its locale subpaths (`/en`, `/rw`, `/fr`).
- The embedded Sanity Studio at `/studio`.
- The enquiry API at `/api/enquiry`.
- Any infrastructure headers, cookies, or redirects configured by this repository.

Out of scope:

- The booking system reachable at `book.arboretumgreenhotel.rw`. It is owned and operated by a third party. Please report issues there directly to the booking vendor.
- Third-party dependencies (Sanity, Vercel, Google Maps, Resend). Report upstream to the vendor.
- Denial-of-service or volumetric attacks that only demonstrate a lack of rate limiting on free infrastructure. The site uses in-memory rate limiting on sensitive endpoints; we are aware this is a best-effort defence.
- Clickjacking on pages without sensitive actions.
- Missing security headers on static assets served from the Vercel CDN.

## Our response

- Acknowledgement within **2 business days**.
- Fix target: **24 hours** for a critical, exploitable issue affecting production; **7 days** for high; **30 days** for medium or lower.
- We will credit you in a public thank-you list on this file if you want and if the report was responsible (private disclosure, reasonable timeline).

## No bounty

Arboretum Green Hotel is a small business and does not run a paid bounty programme. Responsible disclosure is appreciated and credited; no monetary reward is available.

## Thank-you list

(empty for now; we'll add credited reporters here as they come in.)
