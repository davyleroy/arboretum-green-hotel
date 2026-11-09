# Launch runbook (Sun 8 Nov to Sun 15 Nov 2026)

Day-by-day checklist for the unveiling. Follow top to bottom. Nothing here replaces [deployment-agent-brief.md](../deployment-agent-brief.md): this is the "what do I click, what do I paste" view of the same plan.

**Legend.** `[DAVY]` = you do it (login, secret, click). `[AGENT]` = Claude does it (code, docs, verification). `[MANAGER]` = the hotel manager. `[HOLDER]` = the registrar account holder. `[DONE]` prefix = already landed. Rule: secrets never go in chat or files; agent writes the value, Davy pastes it.

**Last updated:** Mon 9 Nov 2026 end of day.

---

## Status at Mon 9 Nov EOD

- Phase A SEO foundations shipped Sun 8 Nov: canonical/hreflang fix, Hotel JSON-LD audit, sitemap, robots, localised 404, security headers in report-only, bookingUrl flag.
- Mon 9 Nov delivered: Sanity project created and seeded, deploy hook + Sanity webhook created and saved, edit-to-live and hero-switch tests passed, staff guide (EN+FR) shipped, hotel handoff LaTeX+PDF shipped, Vercel migration plan shipped, domain plan skeleton shipped, security hardening Phase 1 commits landed (six commits: SECURITY.md, Dependabot, privacy/tech-masking headers, /studio noindex, /api/enquiry rate limit, handoff security posture), WhatsApp-ready registrar request message shipped at [docs/registrar-request.md](./registrar-request.md).
- Awaiting manager reply on: who holds the registrar, who hosts the booking system. Gate 1 deadline Tue 10 Nov 20:00.

---

## Sun 8 Nov — Phase A [DONE]

All seven brief §4 items on main. Build clean, qa:a11y 27 pages clean, qa:ref OK, qa:canon 27 pages clean. See git log commits `6d30958` through `bf124c6`.

---

## Mon 9 Nov

### 1. Finish the Sanity wizard [DAVY] [DONE]

Project ID: `ixpydxmw`, dataset `production`. Three CORS origins added. Davy admin. Editor token `vercel-build` generated and pasted into Vercel.

### 2. Send the manager the message [DAVY] [SENT]

Response pending on: registrar holder identity + booking-system host. Gate 1 confirmation deadline Tue 10 Nov 20:00.

### 3. Vercel Pro decision [DAVY]

Still pending. Recommended before Thu cutover (removes the private-repo commit-author block if the repo stays private). Low urgency since git commits are already authored as `davyleroy`.

### 4. Sanity env vars in Vercel [DAVY] [DONE]

Three variables set on Production + Preview. Note: `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` must be type **Config** (not Secret) because `NEXT_PUBLIC_*` values are exposed to the browser. Only `SANITY_API_WRITE_TOKEN` is Secret.

### 5. Seed verified [AGENT] [DONE]

Build log showed `CMS sync: empty project, seeding from the repo content...` followed by `CMS sync: seed complete.`. Studio at `arboretum-green.vercel.app/studio` opens with all six document types filled in.

### 6. Deploy hook + webhook wired [DAVY + AGENT] [DONE]

6a. Vercel deploy hook `sanity-publish` on branch `main` created. URL stored privately.
6b. Sanity webhook `vercel-redeploy`: dataset `production`, triggers Create/Update/Delete, filter `!(_id in path("drafts.**"))`, POST to the deploy hook, API version `v2021-03-25`, signed webhook off.
6c. End-to-end test passed: outlet hours edited in Studio → public site updated within 2 min → revert worked. Hero switch (video ↔ image) round-trip also passed.

### 7. Security hardening Phase 1 [AGENT] [DONE]

Six commits landed on `main`:
- `e38a468` SECURITY.md disclosure policy + Dependabot (weekly npm, monthly actions) + `npm run audit` script.
- `42eea31` suppress `X-Powered-By` + add COOP, CORP, `X-DNS-Prefetch-Control: off`.
- `96b2c5d` /studio noindex meta + `X-Robots-Tag` header.
- `db5085c` /api/enquiry 4 KB body cap + in-memory 5-req/60s sliding-window rate limit returning 429 + `Retry-After: 60`.
- `20ae0bb` handoff.tex §2.5 security posture summary for the hotel.
- CSP remains in report-only mode through Wed evening burn-in; Thu flip pending burn-in results.

### 8. URL inventory + DOMAIN_PLAN skeleton [AGENT]

Skeleton shipped at [docs/DOMAIN_PLAN.md](./DOMAIN_PLAN.md) with 11 sections ready for Tuesday values. URL inventory table in §8 populated as the manager returns the booking-system platform + a `site:arboretumgreenhotel.rw` crawl.

---

## Tue 10 Nov

### 9. Gate 1: registrar access confirmed by 20:00 [MANAGER + HOLDER]

Primary access model: **option (d), holder does every change, sends screenshot + confirmation per session, Davy verifies via public `dig` from two resolvers (`@1.1.1.1` and `@8.8.8.8`)**. No credentials move.

Fallback: **option (a), 15-minute screen-share** invoked only if a dig check reveals a typo in a time-critical window. No credentials shared in either option.

The message the manager sends the holder is at [docs/registrar-request.md](./registrar-request.md); copy the first `~~~` block into WhatsApp, replace `[Name]` and `[Your name]`, send.

**If 20:00 passes with no reply: postpone the launch to Sun 22 Nov.** Escalation template is the third block in `registrar-request.md`.

### 10. DNS prep [AGENT, with Davy on the dashboard]

10a. **[AGENT]** WHOIS lookup on `arboretumgreenhotel.rw` to confirm the actual registrar. Do not assume Irembo.

10b. **[DAVY]** Vercel → Project → Settings → Domains → Add both:
   - `arboretumgreenhotel.rw`
   - `www.arboretumgreenhotel.rw`

   Both will show "Invalid Configuration" — expected. The page displays the exact A record value for the apex and the CNAME target for `www` that Vercel wants. **Agent captures these exact values** and writes them into [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) §4. Do not use any generic value from a tutorial.

10c. **[DAVY, with the manager / booking host]** Get:
   - IP or CNAME target for `book.` (where the booking system currently lives).
   - Written confirmation the booking host will serve `book.arboretumgreenhotel.rw` with a valid TLS cert.
   - Confirmation the booking app will update any hard-coded URL (common for WordPress) to `https://book.arboretumgreenhotel.rw`.

10d. **[DAVY, if enquiry email should come from the hotel domain]** Add the domain in Resend (hotel account), capture the DNS records Resend lists (usually a `send.` subdomain CNAME + DKIM TXT).

10e. **[AGENT]** Populate the change sheets in [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) §6 and §7 with the exact values from 10b, 10c, 10d. Davy approves in chat before sending Tuesday night follow-up.

10f. **[DAVY]** Send the Tuesday night follow-up message from [docs/registrar-request.md](./registrar-request.md) (second `~~~` block) to the holder with the booking-host target + the Vercel A + the Vercel www CNAME values.

### 11. Editor invite [DAVY]

sanity.io/manage → project → Members → Invite. One hotel staff person, role **Editor** (NOT Administrator), on an email the hotel controls. Attach [docs/STAFF_GUIDE.md](./STAFF_GUIDE.md) in the invite email.

### 12. Staff guide already ready [AGENT] [DONE]

[docs/STAFF_GUIDE.md](./STAFF_GUIDE.md) EN + FR shipped at commit `94284bc`.

---

## Wed 11 Nov: Registrar Session 1 (nothing public changes)

Holder makes every change on the registrar panel; Davy verifies by public DNS lookup after each. Order matters:

1. **Lower TTL to 300 seconds** on the apex A (and AAAA if any) and on the `www` record. Values stay the same, only TTL drops.
2. **Add new record: `book`** (A or CNAME as the booking host specified in step 10c). Pointing at the booking system's current host.
3. **Add Google Search Console verification CNAME** (updated: Google now uses a CNAME for URL-prefix verification, not a TXT on the apex):
   ```
   Host:  kp7fatlmi3dh
   Value: gv-jt4m3wturavpmr.dv.googlehosted.com
   TTL:   3600
   ```
4. **Add Resend DNS records** if prepared in step 10d.
5. **Do not touch** the apex A record value, the `www` value, MX, SPF, DKIM, DMARC, CAA, existing TXT, or NS records.

### Verification by Davy after each holder-confirmation

```bash
# After the TTL change
dig @1.1.1.1 arboretumgreenhotel.rw A
dig @1.1.1.1 www.arboretumgreenhotel.rw
# After book. record added
dig @1.1.1.1 book.arboretumgreenhotel.rw A
# After GSC CNAME added
dig @1.1.1.1 kp7fatlmi3dh.arboretumgreenhotel.rw CNAME
# Verify from a second resolver
dig @8.8.8.8 kp7fatlmi3dh.arboretumgreenhotel.rw CNAME
```

### Gate 2 test (by 18:00)

- `curl -sIL https://book.arboretumgreenhotel.rw` returns 200 with a valid certificate.
- A full test booking flow works end to end on `book.` to the step **before** payment or confirmation (do not submit a real booking).
- The booking app's internal links stay on `book.`, do not jump back to apex.
- Search Console: click **Verify** on the URL-prefix property — must flip to "Ownership verified".

**If Gate 2 fails: no cutover Thursday.** Fix the booking host first. Rolling the apex to Vercel with a broken `book.` would take the hotel's current booking system offline.

### CSP burn-in review [AGENT] (Wed evening)

Open the Vercel preview in a real browser: visit `/en`, `/rw`, `/fr`, the Maps embed on `/en/contact`, the contact form, `/studio`. Browser DevTools console: expect zero CSP violations. If clean, the Thu flip proceeds. If any violation, we stay in report-only for launch and tighten the policy post-unveiling.

### Owner preview [DAVY]

Share `arboretum-green.vercel.app` with the hotel owner, get sign-off on copy, photos, rooms, outlets.

---

## Thu 12 Nov: Registrar Session 2 — cutover (around 09:00 Kigali)

At least 24 hours after Wednesday's TTL change.

### 13. DNS cutover [HOLDER, agent reads out the table]

1. **Apex A:** replace existing value with the Vercel-assigned A captured in step 10b. **Delete any AAAA record on the apex** (would keep part of traffic on the old host).
2. **`www` CNAME:** set to the Vercel-assigned target from 10b. Remove any A record on `www`.
3. **CAA:** if any CAA records exist, add `0 issue "letsencrypt.org"`. If none exist, add nothing.
4. **Do not touch** MX, SPF, DKIM, DMARC, `book`, or anything else.
5. Wait for Vercel Domains page to show both as **Valid** with TLS certs issued (usually 5 to 30 min).

### Gate 3 test (by 12:00)

```bash
curl -sI https://arboretumgreenhotel.rw/en        # 200, server: Vercel
curl -sI http://arboretumgreenhotel.rw/           # 308 to https
curl -sI https://www.arboretumgreenhotel.rw/en/stay  # 308 to apex
curl -sI https://book.arboretumgreenhotel.rw      # 200, valid cert (unchanged)
echo | openssl s_client -connect arboretumgreenhotel.rw:443 -servername arboretumgreenhotel.rw 2>/dev/null | openssl x509 -noout -issuer -dates
# Verify from both resolvers
dig @1.1.1.1 arboretumgreenhotel.rw A
dig @8.8.8.8 arboretumgreenhotel.rw A
dig @1.1.1.1 arboretumgreenhotel.rw AAAA  # expected: empty
```

Plus: Davy sends one email to and one from the hotel address to confirm MX untouched.

**If Gate 3 fails:** roll back DNS from the [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) snapshot (TTL 300 = recovery in 5 to 10 min). Vercel Deployments → previous deployment → Instant Rollback for code.

### 14. Production switch [DAVY]

Vercel → Project → Settings → Environment Variables (Production only, not Preview):

| Name | Set to |
|---|---|
| `SITE_MODE` | `production` (removes noindex, enables indexing in robots) |
| `NEXT_PUBLIC_SITE_URL` | `https://arboretumgreenhotel.rw` (no trailing slash) |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `false` **only if** every marked fact is resolved. Otherwise leave as it is. |

Then: Deployments → Redeploy latest Production. `NEXT_PUBLIC_*` values are baked at build time, so a redeploy is mandatory.

### 15. CSP: flip to enforced [AGENT]

If Wed evening burn-in was clean, change `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in [next.config.ts](../next.config.ts), commit, redeploy. If the burn-in surfaced any violation, we stay report-only through launch and tighten the policy in year 1.

### 16. Vercel.app host redirect [AGENT]

Add a redirects() rule in `next.config.ts` to send `arboretum-green.vercel.app/*` to the apex, with `/studio` excluded so Studio stays reachable as a backup editor entry.

### 17. Set bookingUrl if Gate 2 passed [DAVY]

Either: edit `content/site.json` `bookingUrl` to `https://book.arboretumgreenhotel.rw` and commit, OR set it in Sanity Studio → Site settings → Online booking URL and publish. The "Book online" link in the Book sheet and footer appears automatically.

### 18. Search + listings [DAVY, agent assists]

- **Google Search Console:** property is already verified by the Wed CNAME. Submit `https://arboretumgreenhotel.rw/sitemap.xml`. URL Inspection → Request Indexing on `/en`, `/fr`, `/rw`, `/en/stay`, `/en/contact`.
- **Bing Webmaster Tools:** import from Search Console, submit the same sitemap.
- **Google Business Profile:** update website to `https://arboretumgreenhotel.rw/?src=gmb`. If GBP offers a separate booking link, use `https://book.arboretumgreenhotel.rw`. Hours, phone `+250 781 600 065`, photos from the 26-photo Maps set + two clips.

---

## Fri 13 Nov: full regression + freeze

### 19. Full QA on the real domain [AGENT]

```bash
BASE=https://arboretumgreenhotel.rw npm run qa:a11y   # 27 pages, zero violations
BASE=https://arboretumgreenhotel.rw npm run qa:ref    # Ref AG-M-xxxx after ?src=gmb
BASE=https://arboretumgreenhotel.rw npm run qa:shots  # no overflow at 390px
BASE=https://arboretumgreenhotel.rw SITE_URL=https://arboretumgreenhotel.rw npm run qa:canon
```

Plus:
- Lighthouse mobile on `/`, `/en/stay`, `/en/contact`: perf 90+, a11y 100, SEO 100.
- Hero video plays on a real Android phone and an iPhone (Safari), on mobile data.
- Maps embed loads on `/en/contact`.
- An enquiry email arrives in the hotel inbox (if Resend is set up). Note: rate limit is 5/60s/IP; a burst test should see the 6th POST returning 429.
- Studio edit-to-live works on the apex.
- Every old URL from the step 10 inventory lands on the right page (on `book.` or on our site).
- Google Rich Results Test on `/en` reports a valid `Hotel` entity.

### 20. Security baseline scans [AGENT]

- Mozilla Observatory (`https://observatory.mozilla.org`) on `arboretumgreenhotel.rw` → target grade A or A+.
- securityheaders.com → target A+.
- Screenshots of both saved into the gitignored [docs/launch-values.md](./launch-values.md) as the monthly-rescan baseline.

### 21. Tag and freeze [AGENT]

- `git tag v1.0.0` on the commit that is live.
- Write the launch log entry in `docs/LAUNCH_LOG.md`.
- **End-of-day: code freeze.** No more commits until Sunday, except what Davy explicitly lists on Saturday.

---

## Sat 14 Nov: Davy's audit

[DAVY] Full browse of the site on your own, in all three languages, on phone and laptop. Make a list of anything to fix. Hand the list to the agent; agent only fixes what is on that list.

---

## Sun 15 Nov 08:00 Kigali: unveiling

[AGENT] Watch for the first 4 hours (08:00 to 12:00):

- Vercel runtime errors + logs dashboard.
- Vercel Analytics visitors.
- Search Console Coverage report.
- At 08:15, do one test WhatsApp tap and one enquiry form submission from a phone.
- Report to Davy at 09:00 and 12:00, even if nothing happened.

[DAVY] At 08:00, the social/press announcement goes out with the apex URL.

---

## Rollback reference (keep this handy)

- **DNS rollback:** restore apex A/AAAA and `www` from the snapshot in [DOMAIN_PLAN.md](./DOMAIN_PLAN.md). TTL 300 means recovery in 5 to 10 min. The `book.` record stays (does no harm).
- **Code rollback:** Vercel → Deployments → previous Production deployment → Instant Rollback.
- **Production switch rollback:** Vercel → env vars → flip `SITE_MODE` back to `demo`, redeploy. Returns to noindex.

---

## Phone numbers to have ready on Thu 12 and Fri 13

- Davy mobile
- Hotel manager mobile
- Booking host contact mobile (from step 10c)
- Registrar account holder (from Gate 1)

Put these at the top of [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) §1 so a rollback never waits on anyone.

---

## Files already in the repo (status)

- [docs/registrar-request.md](./registrar-request.md) — WhatsApp-ready message to the holder (shipped `bce75a2`).
- [docs/DOMAIN_PLAN.md](./DOMAIN_PLAN.md) — DNS snapshot, change sheets, URL inventory, rollback contacts (skeleton shipped `9b5c653`, access option (d) added `8885dc0`; fills in Tue 10 Nov).
- [docs/STAFF_GUIDE.md](./STAFF_GUIDE.md) — Sanity Studio how-to in EN + FR (shipped `94284bc`).
- [docs/handoff.tex](./handoff.tex) + [docs/handoff.pdf](./handoff.pdf) — client-facing operating guide + §2.5 security posture (shipped `0ed4ab1`, security section `20ae0bb`).
- [docs/VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md) — post-launch migration playbook + GitHub repo transfer (shipped `f57dd22`, GitHub additions `0261d21`).
- [docs/launch-values.md](./launch-values.md) — gitignored secrets gathering file (shipped `575eec4`).
- `LAUNCH_LOG.md` — write Fri 13 Nov: tag + launch narrative for the record.

---

## If anything is unclear, check the brief

Full architectural rationale, full policy text, full fallback branches: [deployment-agent-brief.md](../deployment-agent-brief.md). This runbook is the skeleton; the brief is the muscle.
