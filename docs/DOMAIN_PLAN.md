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

## 2. Registrar

| Field | Value |
|---|---|
| Registrar name | TODO (Irembo, Pawa, other RICTA-accredited) |
| Registrar URL | TODO |
| Account holder name | TODO |
| Account holder contact (mobile + email) | TODO |
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

## 3. DNS snapshot BEFORE Session 1 (fill in on Tue 10 Nov)

The rollback depends entirely on this snapshot. If anything goes wrong on Thursday, we restore every record to exactly what was here on Tuesday.

Capture the full `dig` output or a screenshot of the registrar panel. Include A, AAAA, CNAME, MX, TXT, CAA, NS with their TTLs for apex, `www`, `book` (if any), `mail` (if any), and anything else in the panel.

```
TODO: paste the output of
$ dig +noall +answer arboretumgreenhotel.rw ANY
$ dig +noall +answer www.arboretumgreenhotel.rw ANY
$ dig +noall +answer book.arboretumgreenhotel.rw ANY
$ dig +noall +answer _dmarc.arboretumgreenhotel.rw TXT
$ dig +noall +answer arboretumgreenhotel.rw NS
```

**Visual snapshot (registrar panel):** TODO attach screenshot or paste table of every record visible in the registrar's DNS editor.

---

## 4. Vercel-assigned DNS values (fill in on Tue 10 Nov, step 9b of runbook)

Captured exactly as Vercel displays them in Project → Settings → Domains after adding `arboretumgreenhotel.rw` and `www.arboretumgreenhotel.rw`. **Do not use any value from a tutorial.** Vercel assigns these per project.

| Record | Target | Source |
|---|---|---|
| `arboretumgreenhotel.rw` A | TODO (exact IP shown by Vercel) | Vercel Domains page |
| `www.arboretumgreenhotel.rw` CNAME | TODO (e.g. `cname.vercel-dns.com`) | Vercel Domains page |

---

## 5. Booking system

| Field | Value |
|---|---|
| Platform | TODO (WordPress plugin? hosted engine? custom PHP?) |
| Hosting provider | TODO (Hostinger, SiteGround, local VPS, cPanel, other) |
| Current IP or CNAME target | TODO |
| Host login contact | TODO (name, mobile, email) |
| Written confirmation host will serve `book.arboretumgreenhotel.rw` with TLS | TODO (yes/no + date received) |
| Has the booking app's hard-coded URL been changed to `https://book.arboretumgreenhotel.rw`? | TODO (yes/no + confirmed by whom) |
| Test booking flow walked end to end on `book.` (before payment step) | TODO (date + any issues) |

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

## 8. Old-site URL inventory (brief §6.1)

The apex currently serves the booking system, so links to it exist in Google, WhatsApp, Instagram, OTAs and bookmarks. Capture every one so we can set up redirects after the cutover.

Capture method:
1. `site:arboretumgreenhotel.rw` on Google.
2. Browse the current apex and note every visible URL in menus, footers, booking confirmation emails.
3. Check Google Business Profile, Instagram bio, Facebook page, OTA listings (Booking.com, Expedia if present) for linked URLs.
4. Check the booking app's own URL scheme (confirmation emails, SMS, QR codes).

| Old URL | What it does today | Target after cutover | Redirect rule added in `next.config.ts`? |
|---|---|---|---|
| TODO | TODO | TODO (new site route or `book.` path) | TODO |

Common patterns to look out for:
- `/booking`, `/book`, `/reservations`, `/reserve` → should redirect to `book.`
- `/rooms`, `/rooms/name` → should redirect to `/stay#name` on the new site, or `book.` if the booking app had its own room pages
- `/menu`, `/restaurant` → should redirect to `/dine`
- `/contact`, `/contact-us` → should redirect to `/contact`
- Any legacy query strings with booking state (e.g. `?room=xyz&dates=...`) → preserve via `:path*` in the redirect rule

**Redirects are added to `next.config.ts` only AFTER Gate 2 passes.** Test each one by hitting the old URL and confirming it lands on the right page.

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
