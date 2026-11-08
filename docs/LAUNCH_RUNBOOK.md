# Launch runbook (Sun 8 Nov to Sun 15 Nov 2026)

Day-by-day checklist for the unveiling. Follow top to bottom. Nothing here replaces [deployment-agent-brief.md](../deployment-agent-brief.md): this is the "what do I click, what do I paste" view of the same plan.

**Legend.** [DAVY] = you do it (login, secret, DNS). [AGENT] = Claude does it (code, docs, verification). [MANAGER] = the hotel manager. Rule: secrets never go in chat or files; agent writes the value, Davy pastes it.

---

## Right now, Sun 8 Nov (Phase A already done)

Phase A code is on `main`: canonical/hreflang fix, Hotel JSON-LD audit, sitemap, robots, localised 404, security headers, bookingUrl flag. Accept bar is green.

What remains for today:

### 1. Finish the Sanity wizard [DAVY]

You just picked "Custom built". Keep clicking through the remaining screens with sensible defaults (team size, usage, etc.). None of them change technical setup.

When the wizard finishes and drops you into sanity.io/manage for the project, do these in order:

1. **Confirm dataset.** Datasets tab shows `production`. If it says `development`, create `production` and delete `development`. Our env var `NEXT_PUBLIC_SANITY_DATASET` is hardcoded to `production` in `.env.example`.
2. **Grab the Project ID.** Top of the project page, 8-character string. Keep it somewhere (notes app, not git, not chat). You will paste this into Vercel tomorrow.
3. **API > Tokens > Add API token.**
   - Name: `vercel-build`
   - Permissions: **Editor** (not Deploy Studio, not Viewer)
   - Click Create, **copy the token once**. It is never shown again.
   - Paste it straight into Vercel (step 2 tomorrow). Do not paste in chat, do not write to a file.
4. **API > CORS Origins > Add** three origins, each with **Allow credentials** ticked:
   - `http://localhost:3000`
   - `https://arboretum-green.vercel.app`
   - `https://arboretumgreenhotel.rw`
5. **Members > Invite.** Add your own personal email (methodworks or similar) as **Administrator**. The one hotel staff Editor comes Tue 10 Nov.

### 2. Send the manager the message [DAVY]

Copy the block in [deployment-agent-brief.md](../deployment-agent-brief.md) section 11 verbatim. Send by WhatsApp or email. You need a response by **Tuesday 10 Nov 20:00** (Gate 1).

Two things you need back from the manager:
- Who holds the domain account (registrar name + account holder) for `arboretumgreenhotel.rw`.
- Who built and who hosts the current booking system that answers on the apex today.

### 3. Vercel Pro decision [DAVY]

Site is commercial. Vercel's Hobby plan terms do not cover it, and a private repo on Hobby blocks deployments of commits not authored by the account owner. Options:

- **Upgrade team to Pro** (recommended). Removes the block, enables custom analytics events.
- **Stay on Hobby and ensure every commit is authored by your GitHub identity.** My git config here is already `davyleroy <d.nkurunziz@alustudent.com>`, so my commits inherit that.

Either works. Pick one and note it in [LAUNCH_LOG.md](./LAUNCH_LOG.md) when that file exists.

---

## Mon 9 Nov

### 4. Add Sanity env vars in Vercel [DAVY]

Vercel > Project `arboretum-green` > Settings > Environment Variables. For each: set both **Production** and **Preview**. Do not add to Development unless you want local dev to hit Sanity too (optional).

| Name | Value | Sensitive |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | the 8-char Project ID from step 1.2 | no |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | no |
| `SANITY_API_WRITE_TOKEN` | the Editor token from step 1.3 | **yes** (tick Sensitive) |

Then: Deployments tab > three-dot menu on the latest Production deployment > **Redeploy**. The prebuild runs [scripts/cms-sync.mjs](../scripts/cms-sync.mjs): if the project is empty, it seeds all documents + 40 photos + the hero video via `createIfNotExists`, then pulls back into `content/*.json`.

### 5. Verify the seed [AGENT]

While the redeploy runs, I will:
- Watch the build log for the `CMS sync: empty project, seeding from the repo content...` line, then `CMS sync: seed complete.`, then a successful build.
- Open `https://arboretum-green.vercel.app/studio`, log in with your Sanity account.
- Click through every document type (Site settings, Rooms, Outlets, Venue, Places, Photos). Confirm each opens with real content (not an empty editor).

If anything is missing, I will report which type and we debug before moving on.

### 6. Wire the deploy hook [DAVY, then AGENT verifies]

6a. **[DAVY]** Vercel > Project > Settings > Git > Deploy Hooks > Create:
   - Name: `sanity-publish`
   - Branch: `main`
   - Click Create, copy the URL (ends in `/api/deploy/xxxxxxxxxxxx`). This URL is a secret.

6b. **[DAVY]** Switch to sanity.io/manage > API > Webhooks > Create webhook:
   - Name: `vercel-redeploy`
   - Dataset: `production`
   - Trigger on: **Create**, **Update**, **Delete** (all three)
   - Filter: `!(_id in path("drafts.**"))`
   - URL: paste the deploy hook URL from 6a
   - HTTP method: POST
   - Save.

6c. **[AGENT]** I walk you through the end-to-end test:
   - In the Studio, change one outlet's `hours` to something obvious, click Publish.
   - Within ~2 minutes, visit the public URL and confirm the new hours show.
   - Revert the change, publish again.
   - Also do the hero switch test: change `heroType` from video to image, publish, verify the homepage hero changes, then switch back.

### 7. Old-site URL inventory [AGENT]

While Davy is on the Vercel/Sanity wiring, I open `docs/DOMAIN_PLAN.md` and populate:

- A `site:arboretumgreenhotel.rw` Google search result list.
- A crawl of the current apex site (if reachable), every URL listed with: what it does, where it should live after cutover (new site vs `book.`).
- Booking system identification from the manager's response (step 2): platform (WordPress? hosted? custom?), host IP or CNAME target, who has login access.

---

## Tue 10 Nov

### 8. Registrar access settled by 20:00 [MANAGER] (Gate 1)

The manager replies with one of the three options from brief §7.1:

- **Option 1 (preferred):** account holder joins a 15-minute screen-share Wed morning. No credentials shared.
- **Option 2:** registrar adds Davy as a technical contact / delegated user.
- **Option 3 (last resort):** account holder gives Davy temporary access; account holder changes the password after Thursday's cutover.

**If 20:00 passes with no access: fallback.** Launch on the vercel.app URL in `SITE_MODE=demo`, slip §7 to §9 by one week. Tell Davy same-day. No cutover without access.

### 9. DNS prep [AGENT, with Davy on the dashboard]

9a. **[AGENT]** WHOIS lookup on `arboretumgreenhotel.rw` to confirm the actual registrar (could be Irembo or another RICTA accredited registrar). Do not assume Irembo.

9b. **[DAVY]** Vercel > Project > Settings > Domains > Add:
   - `arboretumgreenhotel.rw`
   - `www.arboretumgreenhotel.rw`

   Both will show "Invalid Configuration" — expected. The page displays the exact A record value for the apex and the CNAME target for `www` that Vercel wants. **Agent captures these exact values** and writes them into [DOMAIN_PLAN.md](./DOMAIN_PLAN.md). Do not use any generic value from a tutorial.

9c. **[DAVY, with the manager / booking host]** Get:
   - IP or CNAME target for `book.` (where the booking system currently lives).
   - Written confirmation the booking host will serve `book.arboretumgreenhotel.rw` with a valid TLS cert.
   - Confirmation the booking app will update any hard-coded URL (common for WordPress) to `https://book.arboretumgreenhotel.rw`.

9d. **[DAVY, if enquiry email should come from the hotel domain]** Add the domain in Resend (hotel account), capture the DNS records Resend lists (usually a `send.` subdomain + DKIM TXT).

9e. **[AGENT]** Write the change sheets for sessions 1 and 2 into [DOMAIN_PLAN.md](./DOMAIN_PLAN.md): record, type, old value, new value, TTL. Davy approves in chat before any registrar action.

### 10. Editor invite [DAVY]

sanity.io/manage > project > Members > Invite. One hotel staff person, role **Editor** (NOT Administrator), on an email the hotel controls.

### 11. Staff guide ready [AGENT]

I finish [STAFF_GUIDE.md](./STAFF_GUIDE.md) (EN then FR): how to log in at `/studio`, change a price, change opening hours, switch the hero between video and photo, replace a photo with alt text, what "to confirm" means, and that a change takes ~2 minutes to go live. Plus the rule: only HAGY shoot photos or Tenex-approved photos, no people visible.

---

## Wed 11 Nov: Registrar Session 1 (low risk, nothing public changes)

Agent on a call with Davy or the account holder, screen-sharing. Nothing in this session changes what the public sees. Order matters:

1. **Lower TTL to 300 seconds** on the apex A/AAAA record and on the `www` record. This buys us fast rollback on Thursday.
2. **Add new record: `book`** (A or CNAME as the booking host specified in step 9c). Pointing at the booking system's current host.
3. **Add Google Search Console verification TXT** on the apex. (Davy generates this value in Search Console > Add Property > Domain > `arboretumgreenhotel.rw`, then pastes the TXT.)
4. **Add Resend DNS records** if prepared in step 9d.
5. **Do not touch** the apex A record, `www`, MX, SPF, DKIM, DMARC, CAA, existing TXT, or NS records.

### Gate 2 test (by 18:00)

- `curl -sIL https://book.arboretumgreenhotel.rw` returns 200 with a valid certificate.
- A full test booking flow works end to end on `book.` to the step **before** payment or confirmation (do not submit a real booking).
- The booking app's internal links stay on `book.`, do not jump back to apex.
- Search Console property shows "Verified".

**If Gate 2 fails: no cutover Thursday.** Fix the booking host first. Rolling the apex to Vercel with a broken `book.` would take the hotel's current booking system offline.

### Owner preview [DAVY]

Share `arboretum-green.vercel.app` with the hotel owner, get sign-off on copy, photos, rooms, outlets.

---

## Thu 12 Nov: Registrar Session 2, cutover (around 09:00)

At least 24 hours after Wednesday's TTL change.

### 12. DNS cutover [DAVY, agent reads out the table]

1. **Apex:** replace existing A record(s) with the Vercel value captured in step 9b. **Delete any AAAA record on the apex** (would keep part of traffic on the old host).
2. **`www`:** set CNAME to the Vercel target from 9b. Remove any A record on `www`.
3. **CAA:** if any CAA records exist, add `0 issue "letsencrypt.org"`. If none exist, add nothing.
4. **Do not touch** MX, SPF, DKIM, DMARC, `book`, or anything else.
5. Wait for Vercel Domains page to show both as **Valid** with TLS certs issued (usually 5 to 30 min).

### Gate 3 test (by 12:00)

Agent runs section 10.1 of the brief:
```bash
curl -sI https://arboretumgreenhotel.rw/en        # 200, server: Vercel
curl -sI http://arboretumgreenhotel.rw/           # 308 to https
curl -sI https://www.arboretumgreenhotel.rw/en/stay  # 308 to apex
curl -sI https://book.arboretumgreenhotel.rw      # 200, valid cert
echo | openssl s_client -connect arboretumgreenhotel.rw:443 -servername arboretumgreenhotel.rw 2>/dev/null | openssl x509 -noout -issuer -dates
```

Plus: Davy sends one email to and one from the hotel address to confirm MX untouched.

**If Gate 3 fails:** roll back DNS from the [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) snapshot (TTL 300 = recovery in 5 to 10 min). Vercel Deployments > previous deployment > Instant Rollback for code.

### 13. Production switch [DAVY]

Vercel > Project > Settings > Environment Variables (Production only, not Preview):

| Name | Set to |
|---|---|
| `SITE_MODE` | `production` (removes noindex, enables indexing in robots) |
| `NEXT_PUBLIC_SITE_URL` | `https://arboretumgreenhotel.rw` (no trailing slash) |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `false` **only if** every marked fact is resolved. Otherwise leave as it is. |

Then: Deployments > Redeploy latest Production. `NEXT_PUBLIC_*` values are baked at build time, so a redeploy is mandatory.

### 14. Vercel.app host redirect [AGENT]

I add a redirects() rule in `next.config.ts` to send `arboretum-green.vercel.app/*` to the apex, with `/studio` excluded so Studio stays reachable as a backup editor entry.

### 15. Set bookingUrl if Gate 2 passed [DAVY]

Either: edit `content/site.json` `bookingUrl` to `https://book.arboretumgreenhotel.rw` and commit, OR set it in Sanity Studio > Site settings > Online booking URL and publish. The "Book online" link in the Book sheet and footer appears automatically.

### 16. Search + listings [DAVY, agent assists]

- **Google Search Console:** submit `https://arboretumgreenhotel.rw/sitemap.xml`. URL Inspection > Request Indexing on `/en`, `/fr`, `/rw`, `/en/stay`, `/en/contact`.
- **Bing Webmaster Tools:** import from Search Console, submit the same sitemap.
- **Google Business Profile:** update website to `https://arboretumgreenhotel.rw/?src=gmb`. If GBP offers a separate booking link, use `https://book.arboretumgreenhotel.rw`. Hours, phone `+250 781 600 065`, photos from the 26-photo Maps set + two clips.

---

## Fri 13 Nov: full regression + freeze

### 17. Full QA on the real domain [AGENT]

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
- An enquiry email arrives in the hotel inbox (if Resend is set up).
- Studio edit-to-live works on the apex.
- Every old URL from the step 7 inventory lands on the right page (on `book.` or on our site).
- Google Rich Results Test on `/en` reports a valid `Hotel` entity.

### 18. CSP: promote to enforced [AGENT]

If the console shows zero CSP violations across every page, I change `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in [next.config.ts](../next.config.ts), commit, redeploy, repeat the full QA list. If any violation shows up, we fix the policy or leave it in report-only for launch.

### 19. Tag and freeze [AGENT]

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
- **Code rollback:** Vercel > Deployments > previous Production deployment > Instant Rollback.
- **Production switch rollback:** Vercel > env vars > flip `SITE_MODE` back to `demo`, redeploy. Returns to noindex.

---

## Phone numbers to have ready on Thu 12 and Fri 13

- Davy mobile
- Hotel manager mobile
- Booking host contact mobile (from step 9c)
- Registrar account holder (from step 8)

Put these at the top of [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) so a rollback never waits on anyone.

---

## Files to create as we go

- [DOMAIN_PLAN.md](./DOMAIN_PLAN.md) — Tue 10 Nov: snapshot, change sheets, URL inventory, rollback contacts, launch log.
- [STAFF_GUIDE.md](./STAFF_GUIDE.md) — Tue 10 Nov: Sanity Studio how-to in EN + FR for the hotel editor.
- [LAUNCH_LOG.md](./LAUNCH_LOG.md) — Fri 13 Nov: tag + launch narrative for the record.

---

## If anything is unclear, check the brief

Full architectural rationale, full policy text, full fallback branches: [deployment-agent-brief.md](../deployment-agent-brief.md). This runbook is the skeleton; the brief is the muscle.
