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

## 5. GitHub repository migration

The source code lives at `github.com/davyleroy/arboretum-green-hotel`, currently a personal repo on Davy's GitHub account. It moves to the hotel in two phases: **Phase A** adds the hotel as a collaborator immediately (zero risk, zero cost, recoverable). **Phase B** transfers ownership to a hotel-controlled GitHub account or organisation at the same window as the Vercel migration.

### 5a. Phase A: add the hotel as collaborator (do this week)

Low-stakes action that gives the hotel visibility and recovery rights without changing ownership. If anything happened to Davy's GitHub account tomorrow, the hotel still has a copy of the code and the right to fork it.

**Step A1 [HOTEL].** Create (or confirm) a GitHub account on the hotel-controlled email. Ideal: a new account like `arboretumgreen` at `github.com`, verified against `arboretumgreenhotel@gmail.com`. This stays as the hotel's long-term identity on GitHub.

**Step A2 [HOTEL].** Enable **two-factor authentication** on that GitHub account. Required for any account that will later own a private repository.

**Step A3 [DAVY].** On `github.com/davyleroy/arboretum-green-hotel`:
- Settings → Collaborators and teams → **Add people**
- Enter the hotel's GitHub username
- Permission: **Admin** (so the hotel can later accept the repo transfer in Phase B)
- Click Add

**Step A4 [HOTEL].** Open the invitation email from GitHub, click Accept. You now see the repo in your GitHub account's list of repositories under "shared with me".

**That's it for Phase A.** The repo still belongs to Davy. The hotel has read + write + admin access but no billing impact (private repos on GitHub Free plan allow unlimited collaborators).

### 5b. Phase B: transfer ownership (same window as Vercel migration, around Mon 7 Dec)

Converts the hotel from collaborator to owner. Vercel's GitHub integration tracks the repo by internal ID, so the transfer does not break the deploy pipeline. GitHub keeps the old URL redirecting to the new one for the foreseeable future.

**Step B1 [HOTEL].** Decide: transfer to the **hotel's personal GitHub account** (simplest, $0), or to a new **GitHub organisation** called `arboretum-green-hotel` (more formal, $0 on the Free plan for this use case). Trade-offs:

| Target | Pros | Cons | Cost |
|---|---|---|---|
| Hotel personal account | Simplest. One hotel-controlled identity for everything (GitHub + Google + Sanity) | If the hotel adds more developers later they share one login or the account becomes a bottleneck | $0 |
| New GitHub organisation `arboretum-green-hotel` | Cleaner for future growth. Multiple members can be added with individual logins. Looks professional on the public profile | Slight extra setup. GitHub Free org has limited Actions minutes but that does not affect this project | $0 |

**Recommendation:** personal account now, upgrade to an org later if the hotel ever brings on additional contributors. Both options are reversible.

**Step B2 [HOTEL if choosing org path].** github.com → top-right profile menu → Your organizations → **New organization** → Free plan → name `arboretum-green-hotel` → verify hotel email → add Davy as owner.

**Step B3 [DAVY].** On the repo: Settings → scroll to **Danger Zone** at the bottom → **Transfer** → enter the hotel's username or org name → type the repo name to confirm.

**Step B4 [HOTEL].** Accept the transfer invitation in GitHub (shows in a yellow bar at the top of the destination account/org homepage). Confirm within 24 hours; otherwise GitHub cancels the transfer.

**Step B5 [HOTEL].** Add Davy as a collaborator with **Admin** rights on the newly-owned repo:
- Settings → Collaborators (or Members if org) → Add → `davyleroy` → Admin.
- Davy accepts.

**Step B6 [AGENT].** Verify the deploy pipeline survived the transfer:
- Open Vercel → Project → Settings → Git. Repository should now show the new owner path (e.g. `arboretumgreen/arboretum-green-hotel`), not the old `davyleroy/...`. Vercel updates this automatically from GitHub's redirect.
- Trigger a test deploy: push a trivial commit (whitespace change) or hit Redeploy in the Vercel dashboard. Deployment should succeed.
- Trigger the Sanity webhook test (publish a small change in Studio). Deploy hook fires, Vercel deploys. Public site updates in ~2 min.

If any of those three checks fail, the fix is almost always: Vercel GitHub App permissions need re-authorisation on the new owner. Vercel shows the exact remediation link.

**Step B7 [DAVY, cleanup, +7 days].** After a week of stable operation on the hotel-owned repo:
- Remove your personal account as a collaborator if it is no longer needed (you'd stay as Admin per Step B5; this would remove duplicate access).
- Archive any personal forks of the repo (so they do not confuse future audits).

### 5c. What transfers with the repo

| Item | Transfers? | Notes |
|---|---|---|
| All commits, branches, tags | Yes | Full git history preserved |
| Issues and pull requests | Yes | URLs update; old URLs redirect |
| Releases and release assets | Yes | Including any `v1.0.0` tag from launch freeze |
| Stars and watchers | Yes | |
| Deployments (Vercel history) | Yes | Vercel tracks by internal ID |
| GitHub Actions workflows | Yes | May need secret re-creation in the new owner's Actions settings |
| Repository secrets | **No** | GitHub does not transfer secrets. We have none configured for this repo today, so no action needed. |
| Webhooks | Yes | Vercel's deploy integration is a webhook, continues firing |
| Settings (branch protection, etc.) | Yes | |
| Old URLs | Redirect | `github.com/davyleroy/arboretum-green-hotel/*` keeps redirecting to the new path for the foreseeable future |

### 5d. Rollback (if Phase B goes wrong)

GitHub transfers are reversible within the UI for several days:

1. On the new owner's side: repo Settings → Danger Zone → Transfer back to `davyleroy`.
2. Davy accepts on his account.
3. Vercel's GitHub App re-authorisation prompt reappears; approve it.

No data loss; the git history is intact throughout.

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
