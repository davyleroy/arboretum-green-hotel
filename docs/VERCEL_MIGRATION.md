# Vercel migration + hosting cost plan

**Status.** Written 9 Nov 2026 for execution **after** the Sun 15 Nov 2026 unveiling, ideally 3 to 6 weeks post-launch once traffic patterns and the booking subdomain are stable.

**Goal.** Move the Vercel project `arboretum-green` (`prj_M7QgcPftgHegyjgEAudQTIC1cRdh`) from Davy's personal team `davyleroys-projects` to a hotel-owned Vercel team, so Arboretum Green Hotel owns its own hosting bill, access, and DNS attachment. Davy stays on as administrator.

Sister accounts (Sanity, Google Search Console, GBP, Bing, Resend, registrar) are already hotel-owned per brief §2.2, so this file covers only the Vercel move. The "After launch" section at the bottom lists the handovers that will have already happened by the time you execute this.

---

## 1. Why we do this (and why we wait until after launch)

- **Ownership.** Rule 2.2 of the brief: the hotel owns the accounts; Davy is administrator. Vercel is the last account still on Davy's personal scope.
- **Billing.** The hotel pays its own hosting directly, not through Tenex.
- **Access control.** If Davy ever steps back, the site does not go dark with a personal account.

**Why not now:** project transfers during launch week risk breaking the deploy hook, invalidating env vars, or de-attaching the domain. Nothing here is urgent. Thu 12 Nov is DNS cutover; Fri 13 is code freeze; Sat 14 is Davy's audit; Sun 15 is unveiling. Earliest safe migration window: **Mon 7 Dec 2026** (three weeks after launch, after the "watch for first 30 days" settles).

---

## 2. Prerequisites (hotel side, before you start)

The hotel needs these in place before step 4 below. Everything here is a one-time setup:

- [ ] **Hotel billing method.** A credit card or PayPal in the hotel's name, not Davy's. Vercel Pro is billed USD monthly, so the card must accept USD charges.
- [ ] **Hotel email for the Vercel team owner.** Prefer `web@arboretumgreenhotel.rw` (once email on the domain is live) or `arboretumgreenhotel@gmail.com`. **Do not use the manager's personal email** because team ownership would then follow the manager if they leave.
- [ ] **Decide on the Vercel team name.** Suggested: `arboretum-green-hotel`. The URL slug becomes `vercel.com/arboretum-green-hotel/arboretum-green` which stays short and obvious.
- [ ] **Decision on seats.** One seat is enough (Davy as admin). Two seats if the manager wants read-only access to deployment logs. Each extra seat is $20/month, so two seats = $40/month.

---

## 3. The 12-step migration

Each step says who does it. `[HOTEL]` = the hotel staff member with the billing email. `[DAVY]` = Davy on his personal Vercel account. `[AGENT]` = the engineering agent verifying.

### 3a. Pre-migration (T minus 3 days)

**Step 1 [DAVY].** In Davy's current Vercel account: Deployments > snapshot the latest green Production deployment's ID (hex string). Write it into the launch log. This is the rollback target if anything breaks.

**Step 2 [DAVY].** Export env vars for the record:
```bash
# From your laptop, in the repo root:
vercel env pull .env.preview --environment=preview
vercel env pull .env.prod --environment=production
```
Both files are already in `.gitignore` (the `.env*` rule). **Treat them as secret.** Keep them in a password manager, not in the repo working tree after this step.

**Step 3 [DAVY].** List deploy hooks and webhooks so we know what to re-create after the move:
- Vercel > Settings > Git > Deploy Hooks: there should be `sanity-publish` pointing at branch `main`. Write down the hook URL fingerprint (last 8 chars) in the log.
- sanity.io/manage > API > Webhooks: there should be `vercel-redeploy` POSTing to that URL. Note its filter and settings.

### 3b. Create the hotel team

**Step 4 [HOTEL].** Sign in to vercel.com with the **hotel-controlled email** from §2. If the account does not exist, create it (verify email, set a strong password, enable 2FA).

**Step 5 [HOTEL].** Create a new team: Vercel > top-left team switcher > **Create Team** > name `arboretum-green-hotel`, plan **Pro** ($20/month base, see §6 below). Add the hotel billing card.

**Step 6 [HOTEL].** Invite Davy as **Owner** or **Admin** on the new team (Settings > Members > Invite). Davy accepts the invite.

### 3c. Transfer the project

**Step 7 [DAVY].** In Davy's personal team, open the `arboretum-green` project > Settings > General > scroll to **Transfer Project**. Choose destination team: `arboretum-green-hotel`. Vercel issues a transfer request; it needs acceptance on the destination side.

> **Important Vercel transfer rules:**
> - **Domains:** attached custom domains transfer with the project. `arboretumgreenhotel.rw` and `www.arboretumgreenhotel.rw` will keep pointing at the same Vercel infra. DNS at the registrar does not change. TLS cert stays valid.
> - **Env vars:** transfer with the project. No re-paste needed.
> - **Deployment history:** stays attached to the project.
> - **Deploy hooks:** stay attached but their URLs do **not** change. The Sanity webhook keeps working.
> - **GitHub integration:** transfers, but the destination team must have GitHub connected (next step).
> - **Vercel Analytics data:** transfers.
> - **What does NOT transfer:** team members (destination team needs its own), Vercel usage history for billing purposes (fresh billing starts).

**Step 8 [HOTEL].** On the new team, Project Transfers tab > Accept the incoming request.

**Step 9 [HOTEL, with Davy on call].** After acceptance:
- **GitHub integration:** if the new team does not have GitHub connected, Settings > Git > Install GitHub App > authorise access to the `davyleroy/arboretum-green-hotel` repo. If the repo is owned by Davy personally, Davy may need to grant the hotel's GitHub org (if any) collaborator access; otherwise keep the install scoped to the personal repo and the deploy flow still works.
- **Trigger a fresh deploy to verify:** Settings > Git > Redeploy. This confirms the new team can see the repo, build, and ship.

### 3d. Post-migration checks

**Step 10 [AGENT].** Verify the production site is still live and healthy:
```bash
curl -sI https://arboretumgreenhotel.rw/en     # 200, server: Vercel
curl -sI https://www.arboretumgreenhotel.rw/   # 308 to apex
curl -sI https://book.arboretumgreenhotel.rw   # 200 (unchanged, booking host)
echo | openssl s_client -connect arboretumgreenhotel.rw:443 -servername arboretumgreenhotel.rw 2>/dev/null | openssl x509 -noout -issuer -dates
```

All four should match the pre-migration baseline. If any header, redirect chain, or cert changes, roll back (see §4).

**Step 11 [AGENT].** Edit-to-live smoke test. Open `/studio`, change one outlet's hours, publish. Vercel Deployments on the **new team** should show a deploy triggered by **Deploy Hook**. If it shows on the old team's dashboard instead, the hook did not get updated (shouldn't happen per step 7 note, but verify). Revert the change.

**Step 12 [HOTEL].** Open the Billing tab on the new team. Confirm the subscription is active, the card was charged a pro-rated amount, and next billing date is correct.

### 3e. Tidy up

**Step 13 [DAVY].** After 7 days of stable operation on the new team:
- Delete the empty `arboretum-green` project from the old `davyleroys-projects` team (Settings > General > Delete Project). It's already a shell because the real project moved; but a shell project would confuse future audits.
- Shred the `.env.preview` / `.env.prod` files from step 2 unless they were stored in a password manager.
- Rotate the Sanity Editor token (`vercel-build`): generate a new one in Sanity, update the new Vercel team's env var, revoke the old. First rotation marker in [launch-values.md](./launch-values.md) section 9.
- Rotate the deploy hook URL: delete + recreate in Vercel, update the Sanity webhook to the new URL.

---

## 4. Rollback (if step 10 or 11 fails)

Vercel's project transfer is reversible within the same UI as long as both teams still exist:

- **Project transfer rollback:** destination team > project > Settings > General > Transfer Project > choose Davy's personal team. Davy accepts on his side.
- **DNS:** nothing to change; domain attachment moves with the project.
- **Env vars:** nothing to change; they travel with the project.
- **Billing:** the destination team gets a pro-rated credit for the partial month.

In the worst case where the transfer UI misbehaves: the previous production deployment URL (`arboretum-green-xxxxxx.vercel.app` for the ID from step 1) still resolves on Vercel's infra. You can repoint DNS back to a fresh Vercel deploy on Davy's team as a hot standby, but this is extreme and should not be needed.

---

## 5. What stays on Davy's account forever

Only his personal GitHub account owning the fork of the repo (if any). The GitHub repository itself (`davyleroy/arboretum-green-hotel`) is a personal asset. Two options for that too, both outside this doc's scope:

1. **Leave the repo in Davy's name** with the hotel team as a Vercel collaborator. Cheapest, no disruption.
2. **Transfer the repo to an Arboretum GitHub org** (hotel creates one, Davy transfers, both sides get access). More formal; costs the hotel nothing if the org stays on the free GitHub plan with a public or single-repo private setup. Needed only if the hotel wants true ownership of source code.

Discuss with the manager after the Vercel move is complete.

---

## 6. Cost plan for Arboretum's expected traffic

### Traffic profile (owner input)

- **Daily visitors:** 500 to 1,000 (peak season).
- **Peak concurrency:** up to 400 users accessing simultaneously.
- **Likely pattern:** marketing site, mostly static; occasional deeper browsing (room photos, dining menu, gallery). WhatsApp or `book.` carries actual booking traffic, not the main site.

### What Vercel actually bills on

Vercel does not bill per concurrent user. The relevant dimensions are:

| Dimension | What it measures | Pro plan included | Your estimated monthly usage |
|---|---|---|---|
| **Bandwidth (GB)** | Egress from the CDN to visitors | 1 TB (1,000 GB) | 60 to 150 GB |
| **Function invocations** | API routes + SSR | 1 million | < 50,000 (mostly static) |
| **Edge requests** | Static page serves from the edge CDN | 10 million | 2 to 4 million |
| **Image optimization** | `next/image` transformations | 5,000 source images | < 500 (seed is 40 photos) |
| **Build minutes** | CI builds triggered per month | 6,000 minutes | 100 to 300 (10 to 30 publishes a month) |
| **Observability data** | Runtime logs + traces | included with cap | within cap |

### How the estimate was made

- **Bandwidth per visitor, first visit, typical journey through 3 to 4 pages:**
  - HTML + JS/CSS first load: ~150 KB
  - Hero video first chunks (streamed, not full file): ~500 KB
  - 2 to 3 subsequent pages via next/link: ~100 KB each
  - Photos as needed: ~250 KB per page avg
  - **Rough total per fresh visit:** ~1.5 to 2 MB

- **Daily bandwidth at 1,000 visitors × 2 MB:** 2 GB/day = 60 GB/month.
- **Add caching misses, repeat visits, bot crawling, image optimization overhead:** inflate 2x to 2.5x = **100 to 150 GB/month realistic**.
- Even at a burst month of 150 GB, you use **15%** of the Pro bandwidth allowance.

- **Concurrency.** 400 concurrent users on a static site is ~13 requests per second (each user takes an action every ~30 seconds). Vercel's edge CDN handles this per single region in milliseconds. Not a bottleneck; not a cost driver.

### What the hotel pays Vercel per month

**Pro plan: $20 USD per seat per month.**

- **1 seat (Davy as admin) = $20/month.** Recommended. The manager does not need a Vercel login to run the hotel; all content edits happen in Sanity Studio, not Vercel.
- **2 seats (Davy + manager read-only for deployment visibility) = $40/month.** Only if the manager specifically wants to see "is the site deploying now?" without asking Davy.

**Likely overages:** none at this traffic level. The Pro plan's 1 TB bandwidth is roughly 7x what you'll use at a peak month of 150 GB.

**If traffic 10x's (unlikely but let's plan):** you'd hit 1.5 TB/month, 500 GB over. Vercel charges $0.15/GB bandwidth overage on Pro, so $75 extra. Still cheap. You would get an alert long before this.

### Annual Vercel cost at your profile

| Scenario | Monthly | Annual (USD) | Annual (RWF at ~1,350/USD) |
|---|---|---|---|
| **1 seat, expected traffic** | $20 | $240 | ~325,000 RWF |
| 2 seats, expected traffic | $40 | $480 | ~650,000 RWF |
| 1 seat, 10x traffic burst | $20 + ~$30 average overage | ~$600 | ~810,000 RWF |

**Recommended budget line for the hotel:** $240/year for Vercel (1 seat, expected traffic). Add a 50% buffer for safety: **$360/year** = about **490,000 RWF/year**.

### Non-Vercel costs to budget alongside

| Item | Yearly (USD) | Notes |
|---|---|---|
| Vercel Pro | 240 | §6 above |
| Domain renewal (`arboretumgreenhotel.rw`) | 30 to 50 | .rw registry; depends on registrar markup |
| Sanity CMS | **0** | Free plan: 3 users, 10k docs, 5 GB bandwidth. You use < 50 docs and < 1 GB. Will stay free. |
| Resend (transactional email for enquiry form, if enabled) | **0** | Free plan: 100 emails/day, 3,000/month. Hotel enquiries will not approach this. |
| Google Analytics / Search Console / GBP | **0** | All free from Google. |
| **Total yearly cost to the hotel** | **270 to 290** | **~370,000 RWF** |

Add the recommended 50% safety buffer: **~$435/year = 585,000 RWF/year**.

**By comparison:** a shared-hosting WordPress plan with similar performance would cost 100 to 300 USD/year but need a developer to keep secure, and would not survive 400 concurrent users on a $5/month shared plan. The Vercel + Sanity stack is both cheaper to operate and more resilient.

---

## 7. Scaling scenarios (what triggers an upgrade)

Keep these in mind only if traffic grows substantially:

- **Pro plan handles up to ~10x current traffic** before overages kick in. No action needed.
- **Enterprise plan ($2,500/month base)** makes sense only if: the hotel adds a booking engine on the main site (not `book.`), opens a second property under the same domain, or SLA-sensitive integrations arrive. None of this is forecast.
- **Sanity Growth plan ($15/month/user)** kicks in if the hotel exceeds 3 editors or needs document versioning / scheduled publishing. For a 1-editor shop, free forever.
- **Resend paid ($20/month)** only if enquiries exceed 100/day for 30 consecutive days.

---

## 8. Billing + ownership summary after migration

| Account | Owner | Davy's role | Monthly cost to hotel |
|---|---|---|---|
| Vercel team `arboretum-green-hotel` | hotel | Admin | $20 |
| Sanity org "Arboretum Green Hotel" | hotel | Admin | $0 |
| Google Search Console | hotel | Owner | $0 |
| Google Business Profile | hotel | Manager | $0 |
| Bing Webmaster Tools | hotel | Imported from GSC | $0 |
| Resend (if used) | hotel | Admin | $0 |
| Domain registrar | hotel (manager holds it) | Technical contact if possible | $30 to 50/yr |
| GitHub repo | Davy (option 1) or hotel org (option 2) | Owner / Admin | $0 (Free tier) |

---

## 9. Pre-migration checklist to run through the week before

- [ ] Launch (Sun 15 Nov) is behind you by at least 21 days.
- [ ] No open critical incidents on Vercel Analytics or Search Console.
- [ ] You have a 4-hour calm window on a non-business day (Sunday morning Kigali is ideal).
- [ ] The hotel's billing card is confirmed to work on USD.
- [ ] Step 2 env var export is done and stored safely.
- [ ] You have Davy and one hotel contact on a call for steps 7 to 12.

If any box is unticked, postpone.

---

## 10. After migration, what the hotel actually sees month to month

1. Credit card statement: one line, `VERCEL INC`, $20.00, 1st of each month.
2. Automated email from Vercel Analytics once a month with visitor summary.
3. No other Vercel communications unless usage approaches a limit.
4. Sanity, Google, Bing, Resend: no billing contact at all (all free).

Everything else (deploys when the manager publishes in Studio, cert renewals, security patches, Next.js updates) happens silently and does not generate hotel-facing noise.

---

## Related docs

- [AGENT_BRIEF.md](./AGENT_BRIEF.md) section 2.2 and 2.4: account ownership and plan decision.
- [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md): day-by-day launch plan (prerequisite to this migration).
- [launch-values.md](./launch-values.md) (gitignored): where to write updated tokens and hook URLs after rotation in step 13.
