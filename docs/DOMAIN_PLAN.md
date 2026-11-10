# Domain plan: `arboretumgreenhotel.rw`

Working document for the DNS cutover week (Mon 9 Nov to Thu 12 Nov 2026). Populated as values are captured. Nothing here is theoretical; every row either has a confirmed value or a `TODO` marker.

Companion files:
- [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md): day-by-day steps.
- [AGENT_BRIEF.md](./AGENT_BRIEF.md): architectural rationale, fallback branches.
- [launch-values.md](./launch-values.md) (gitignored): any secret values like registrar login (if used).

---

## 1. Rollback contacts (fill this first)

**Phone numbers to have in your pocket Wed–Fri.** Any rollback depends on reaching these people fast.

| Role | Name | Mobile | Available |
|---|---|---|---|
| Lead engineer | Davy Mbuto (Tenex) | TODO | Wed 11 – Sun 15 Nov |
| Hotel manager | TODO | TODO | Wed – Sun |
| Registrar account holder | TODO | TODO | Wed 11, Thu 12 |
| Booking system host contact | TODO | TODO | Wed 11, Thu 12 |
| Hotel owner (decision escalation) | TODO | TODO | Fri – Sun |

---

## 2. Registrar + DNS host (CRITICAL UPDATE from Mon 9 Nov crawl)

**Key finding:** DNS is on **Cloudflare**, not the registrar. The nameservers are `braelyn.ns.cloudflare.com` and `brian.ns.cloudflare.com`. That means:

- **The record changes in §6 and §7 are made on Cloudflare, not on the registrar panel.**
- The registrar (likely Irembo per the hotel) only controls who owns the domain name itself. Access to the registrar is only needed for annual renewal and for any eventual ownership transfer, not for this cutover.
- Brief rule 4 (do not move nameservers) is automatically satisfied: we only change A/AAAA/CNAME records on Cloudflare, never NS.

| Field | Value |
|---|---|
| **DNS host (where cutover happens)** | **Cloudflare** |
| Cloudflare account holder | TODO (ask the manager who owns the Cloudflare account; may be the same person as the registrar or a different person who set up the old site) |
| Cloudflare account holder contact | TODO |
| **Registrar name** (confirmed via WHOIS Tue 10 Nov) | **Irembo** (operated by Esicia) |
| Registrar support email | `domain@esicia.rw` |
| Registrar support phone | `+250 788 301 700` |
| Registrar account holder name | TODO (whoever registered the domain on 2026-09-29) |
| Registrar account holder contact | TODO |
| Domain created | 2026-09-29 |
| Domain expiry | 2027-09-29 (11 months; set a calendar reminder for Aug 2027) |
| Registry domain ID | `2705336RICTA` |
| Relationship to hotel | TODO (manager / IT partner / old-site agency) |
| Chosen access option | **(d) Primary: holder makes every change, sends screenshot + confirmation; Davy verifies via public `dig` from both 1.1.1.1 and 8.8.8.8.** Fallback to (a) 15-min screen-share only if a dig check fails and a timing-critical window needs a live fix. No credentials move in either case. |
| Date of registrar session 1 | Wed 11 Nov 2026, time TODO |
| Date of registrar session 2 (cutover) | Thu 12 Nov 2026, around 09:00 Kigali |
| Expiry date of current registration | TODO (check at https://whois.ricta.org.rw) |
| Auto-renew enabled? | TODO |

**Note on brief rule 2.1:** credentials never pass through chat or files. Option (d) satisfies this by design: the holder is the only person who ever logs in. Davy verifies every change by public DNS lookup, never by seeing the registrar UI.

**Verification pattern after each session:**
```bash
# After Session 1 (Wed), apex and www should be UNCHANGED (TTL 300 only):
dig @1.1.1.1 arboretumgreenhotel.rw A
dig @1.1.1.1 arboretumgreenhotel.rw AAAA
dig @1.1.1.1 www.arboretumgreenhotel.rw
# NEW records should resolve:
dig @1.1.1.1 book.arboretumgreenhotel.rw A
dig @1.1.1.1 kp7fatlmi3dh.arboretumgreenhotel.rw CNAME

# After Session 2 (Thu), apex should point to Vercel:
dig @1.1.1.1 arboretumgreenhotel.rw A
dig @1.1.1.1 arboretumgreenhotel.rw AAAA     # expected: empty
dig @1.1.1.1 www.arboretumgreenhotel.rw CNAME

# Double-check from Google's resolver to catch any single-resolver caching:
dig @8.8.8.8 arboretumgreenhotel.rw A
```

---

## 3. DNS snapshot (captured Mon 9 Nov 2026 EOD)

Captured via `dig @1.1.1.1` directly. Serves as rollback baseline.

```
arboretumgreenhotel.rw     A      172.67.162.241          (Cloudflare proxy)
arboretumgreenhotel.rw     A      104.21.57.102           (Cloudflare proxy)
arboretumgreenhotel.rw     AAAA   2606:4700:3036::ac43:a2f1
arboretumgreenhotel.rw     AAAA   2606:4700:3035::6815:3966
www.arboretumgreenhotel.rw A      172.67.162.241
www.arboretumgreenhotel.rw A      104.21.57.102

arboretumgreenhotel.rw     MX     (NONE)
arboretumgreenhotel.rw     TXT    (NONE)
arboretumgreenhotel.rw     CAA    (NONE)
arboretumgreenhotel.rw     NS     braelyn.ns.cloudflare.com
arboretumgreenhotel.rw     NS     brian.ns.cloudflare.com

book.arboretumgreenhotel.rw     (does not exist)
```

**Important observations from the snapshot:**

1. **No MX records** — the hotel does not receive email on this domain today. Brief rule 5 about never touching MX is trivially satisfied (there's nothing to touch). Note: `web@arboretumgreenhotel.rw` as a contact address does not actually work right now; the hotel uses `arboretumgreenhotel@gmail.com`.
2. **No CAA records** — the §7 Session 2 CAA addition is a no-op (brief says "add only if other CAA records exist").
3. **AAAA records exist** — these must be deleted during Session 2, not just left in place. Otherwise part of visitor traffic keeps routing to Cloudflare while A points to Vercel.
4. **`book.` does not exist today** — confirms brief §12's correction: `book` is a new record to add in Session 1.
5. **Cloudflare proxy is in front of an unknown origin.** The origin IP that hosts the current static site is not visible from the outside. The Cloudflare account holder sees it; the holder is the person who set up this proxy.

**Visual snapshot (Cloudflare DNS panel):** TODO attach a screenshot from the Cloudflare account holder's DNS tab, showing every record including any hidden proxied ones.

---

## 4. Vercel-assigned DNS values (fill in on Tue 10 Nov, step 9b of runbook)

Captured exactly as Vercel displays them in Project → Settings → Domains after adding `arboretumgreenhotel.rw` and `www.arboretumgreenhotel.rw`. **Do not use any value from a tutorial.** Vercel assigns these per project.

| Record | Target | Source |
|---|---|---|
| `arboretumgreenhotel.rw` A | TODO (exact IP shown by Vercel) | Vercel Domains page |
| `www.arboretumgreenhotel.rw` CNAME | TODO (e.g. `cname.vercel-dns.com`) | Vercel Domains page |

---

## 5. Booking system (CRITICAL UPDATE from Mon 9 Nov crawl)

**Key finding:** there is **no sophisticated booking system** at `arboretumgreenhotel.rw` today. The current site is a **static HTML website** with a `/book.html` page that almost certainly leads to a WhatsApp or email-based booking flow (same pattern the new site uses). There is no booking engine like SiteMinder, HotelRunner, or Little Hotelier in the picture.

This means the "preserve the booking system at `book.*`" story from the brief is simpler than planned, with two options:

| Field | Value |
|---|---|
| Platform | **Static HTML, custom-built**. No CMS, no booking engine. 9 static pages served from `/assets/` images, last-modified 30 Sep 2026. |
| Hosting provider (origin behind Cloudflare) | TODO (hidden by Cloudflare proxy; ask the Cloudflare account holder) |
| Current origin IP or CNAME target | TODO (visible to the Cloudflare account holder in DNS → original record, not to the public) |
| Host login contact | TODO |
| Written confirmation host will serve `book.arboretumgreenhotel.rw` with TLS | N/A under Option B (recommended) |
| Has the booking app's hard-coded URL been changed? | N/A under Option B |
| Test booking flow walked end to end on `book.` | N/A under Option B |

### Option A — preserve as-is at `book.`

Point `book.arboretumgreenhotel.rw` at the current origin (behind or in front of Cloudflare proxy). The old static site stays live at `book.` for 60 days while analytics confirms whether anyone uses it. Cost: unchanged hosting. Needs: Cloudflare account holder's time to configure, origin IP, confirmation the old host will serve the new hostname.

### Option B — retire the old static site, redirect old URLs (recommended)

The new site at the apex already handles everything the old site did, in three languages, with WhatsApp booking, with proper SEO, with a Sanity CMS. There is nothing worth preserving about the old static HTML except the URLs users may have bookmarked. Those we handle with 308 redirects in [next.config.ts](../next.config.ts). The old host contract can be wound down.

**Redirects to add in Session 2 (after cutover, via `next.config.ts` `redirects()`):**

| Old URL | New destination | Notes |
|---|---|---|
| `/about.html` | `/en/discover` | About was general "about us" text, now part of Discover |
| `/rooms.html` | `/en/stay` | |
| `/services.html` | `/en/dine` | Services on the old site was dining + meet |
| `/discover.html` | `/en/discover` | |
| `/contact.html` | `/en/contact` | |
| `/book.html` | `/en/stay?src=book` | Old booking page → new stay page with booking CTA |
| `/feedback.html` | `/en/contact?type=feedback` | |
| `/login.html` | drop (staff-only, no public bookmarks) | 404 is fine |
| `/assets/images/*.jpg` | drop | 404 is fine; old images were low-quality anyway |

**Recommendation: go with Option B** unless the manager has a specific reason to keep the old site alive. Reasons to pick A would be: an OTA (Booking.com, Expedia) has the specific URL `/book.html` deep-linked in a listing that cannot be updated, or the hotel owner has an emotional attachment to the old site. Neither is likely.

Pending from the manager: a decision between A and B.

---

## 6. Session 1 change sheet (Wed 11 Nov)

**Nothing public changes in this session.** The apex and `www` are untouched. We lower TTLs (enabling fast rollback on Thu), add the `book.` record, add the Google Search Console TXT, and if needed Resend's DNS.

| Action | Record | Type | Old value | New value | TTL |
|---|---|---|---|---|---|
| **Lower TTL** | `arboretumgreenhotel.rw` | A | TODO (current TTL) | same IP, TTL 300 | 300 |
| **Lower TTL** | `arboretumgreenhotel.rw` | AAAA (if any) | TODO | same v6 addr, TTL 300 | 300 |
| **Lower TTL** | `www.arboretumgreenhotel.rw` | A or CNAME | TODO | same, TTL 300 | 300 |
| **Add** | `book.arboretumgreenhotel.rw` | A or CNAME | (none) | TODO (from §5) | 3600 |
| **Add** | `arboretumgreenhotel.rw` | TXT | (none) | `google-site-verification=TODO` | 3600 |
| **Add** | `arboretumgreenhotel.rw` | TXT | (none) | TODO (Resend DKIM if applicable) | 3600 |
| **Add** | `send.arboretumgreenhotel.rw` | CNAME | (none) | TODO (Resend domain target if applicable) | 3600 |
| **Do NOT touch** | apex A/AAAA value | — | keep | keep | lowered TTL only |
| **Do NOT touch** | `www` target | — | keep | keep | lowered TTL only |
| **Do NOT touch** | MX, SPF, DKIM, DMARC, CAA, existing TXT, NS | — | keep | keep | keep |

### Gate 2 test (by Wed 11 Nov 18:00)

- [ ] `curl -sIL https://book.arboretumgreenhotel.rw` → 200 with valid certificate
- [ ] Test booking flow works end to end on `book.` to the step before payment
- [ ] Booking app's internal links stay on `book.` (do not jump back to apex)
- [ ] Search Console property `arboretumgreenhotel.rw` shows "Verified"

**If Gate 2 fails:** do NOT cut over the apex on Thursday. Fix `book.` first.

---

## 7. Session 2 change sheet (Thu 12 Nov, ~09:00)

At least 24 hours after Session 1.

| Action | Record | Type | Old value | New value | TTL |
|---|---|---|---|---|---|
| **Replace** | `arboretumgreenhotel.rw` | A | TODO (old apex IP) | TODO (Vercel A from §4) | 300 then 3600 |
| **Delete** | `arboretumgreenhotel.rw` | AAAA (if any) | TODO | (delete record) | — |
| **Replace** | `www.arboretumgreenhotel.rw` | CNAME | TODO (old) | TODO (Vercel CNAME from §4) | 300 then 3600 |
| **Delete** | `www.arboretumgreenhotel.rw` | A (if any, replaced by CNAME) | TODO | (delete record) | — |
| **Add if none exist** | `arboretumgreenhotel.rw` | CAA | (none) | `0 issue "letsencrypt.org"` | 3600 |
| **Do NOT touch** | MX, SPF, DKIM, DMARC, book, send, existing TXT, NS | — | keep | keep | keep |

After the change takes effect on Vercel's end (Vercel Domains page shows both as "Valid" with TLS certs issued, usually 5 to 30 min):

### Gate 3 test (by Thu 12 Nov 12:00)

```bash
curl -sI https://arboretumgreenhotel.rw/en     # 200, header server: Vercel
curl -sI http://arboretumgreenhotel.rw/        # 308 to https
curl -sI https://www.arboretumgreenhotel.rw/en/stay  # 308 to apex
curl -sI https://arboretumgreenhotel.rw/       # 307 to a locale
curl -sI https://book.arboretumgreenhotel.rw   # 200, valid cert (unchanged)
echo | openssl s_client -connect arboretumgreenhotel.rw:443 -servername arboretumgreenhotel.rw 2>/dev/null | openssl x509 -noout -issuer -dates
```

Plus: Davy sends one email to and one from the hotel address after the cutover to confirm MX was not disturbed.

**If Gate 3 fails:** roll back (section 9 below).

---

## 8. Old-site URL inventory (captured Mon 9 Nov 2026)

Captured via WebFetch of `https://arboretumgreenhotel.rw/` on Mon 9 Nov. The current site is static HTML with nine routes. Full table:

| Old URL | What it does today | Target after cutover (Option B) | Redirect in `next.config.ts` |
|---|---|---|---|
| `/` | Homepage with hotel overview | `/` (locale middleware redirects to `/en`, `/rw`, or `/fr`) | Not needed (same path) |
| `/about.html` | About the hotel | `/en/discover` | Add 308 |
| `/rooms.html` | Room listing (single, double, suite, VIP) | `/en/stay` | Add 308 |
| `/services.html` | Services (dining, hall) | `/en/dine` | Add 308 |
| `/discover.html` | Local area | `/en/discover` | Add 308 |
| `/contact.html` | Contact info + phone | `/en/contact` | Add 308 |
| `/book.html` | Booking entry point | `/en/stay?src=book` | Add 308 |
| `/feedback.html` | Feedback form | `/en/contact?type=feedback` | Add 308 |
| `/login.html` | Staff login (unknown destination) | Drop (404 fine; no public bookmarks) | None |
| `/assets/images/*.jpg` | Images (room-single, room-double, room-suite, room-vip, logo.png) | Drop (404 fine; new site has fresh HAGY photography) | None |

**Phones observed on the old site:**
- `0781 600 065` (matches brief) → tel link format `+250 781 600 065`
- `0781 560 066` (matches brief) → tel link format `+250 781 560 066`

**Email observed:** redacted on the fetched page; the hotel uses `arboretumgreenhotel@gmail.com` per brief.

**Other things to check off-site (none crawled yet):**

- [ ] `site:arboretumgreenhotel.rw` on Google — any indexed URLs not in the table above?
- [ ] Google Business Profile — which URL is linked as the website?
- [ ] Instagram bio and Facebook page — which URL is linked?
- [ ] Any Booking.com, Expedia, or TripAdvisor listing — does it deep-link to a specific URL on the old site?
- [ ] Printed collateral (QR codes on business cards, menus, receipts) — which URL do they encode?

Each of these may surface a URL that needs its own redirect rule. Capture on Tue 10 Nov and add rows above.

**When the redirects go in:** AFTER Gate 2 passes on Wed 11 Nov. Each rule tested by hitting the old URL and confirming it lands on the right page. Rules live in [next.config.ts](../next.config.ts) `redirects()`.

---

## 9. Rollback procedures

### 9a. DNS rollback (from Session 2)

If Gate 3 fails or the site misbehaves after Thursday's cutover:

1. Open the registrar panel.
2. Restore the apex A record to the value in §3 snapshot.
3. Restore AAAA if the snapshot had one.
4. Restore `www` CNAME (or A) to the value in §3 snapshot.
5. Leave `book.`, CAA, and all §6 additions in place (they do no harm).

With TTL 300, the switch back takes approximately 5 to 10 minutes. Monitor at `dig arboretumgreenhotel.rw @1.1.1.1` and `dig arboretumgreenhotel.rw @8.8.8.8`.

### 9b. Code rollback

Vercel → Deployments → previous Production deployment → **Instant Rollback**.

### 9c. Combined rollback (DNS + code)

Do DNS first (reverses the public cutover) then code (reverses the SITE_MODE flip and any `bookingUrl` publish). The combined recovery window is approximately 10 to 15 minutes.

### 9d. Who to call

- Davy (Tenex): see §1.
- Registrar account holder: see §1.
- Booking host contact: see §1.

---

## 10. Post-launch: TTL restoration (Mon 16 Nov)

Session 3 (optional, but recommended). Raise the TTL on apex A and `www` back to `3600` to reduce DNS lookup latency for visitors. Low-risk change; no rollback required.

| Action | Record | New TTL |
|---|---|---|
| **Raise TTL** | `arboretumgreenhotel.rw` A | 3600 |
| **Raise TTL** | `www.arboretumgreenhotel.rw` CNAME | 3600 |

---

## 11. Launch log (append-only; filled in as we go)

### Mon 9 Nov 2026

- Sanity project `ixpydxmw` created, env vars added to Vercel (production + preview), first seed deploy green.
- Deploy hook created in Vercel: `sanity-publish` on `main`.
- Sanity webhook created and saved: `vercel-redeploy`, POST, filter excludes drafts.
- Edit-to-live and hero-switch tests both passed; CMS edit propagates to public site within ~2 min.
- Registrar holder identified (TODO add name + registrar + access option after Tue capture).

### Tue 10 Nov 2026

- TODO.

### Wed 11 Nov 2026 (Session 1)

- TODO.

### Thu 12 Nov 2026 (Session 2, cutover)

- TODO.

### Fri 13 Nov 2026 (freeze)

- TODO.

### Sat 14 Nov 2026 (Davy's audit)

- TODO.

### Sun 15 Nov 2026 (unveiling)

- TODO.
