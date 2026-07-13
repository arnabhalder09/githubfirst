# Meta Ads Campaign — HVAC Leads (USA)

Landing page: `/hvac-leads` (this repo). Append `?utm_source=meta&utm_campaign=<name>&utm_content=<variant>`
to the destination URL for each ad so the page swaps its hero copy to match
your ad angle and the lead form captures attribution.

`utm_content` variants wired up on the page: `default`, `emergency`, `savings`, `install`.

## Lead delivery (GoHighLevel)

`/api/hvac-leads` upserts every submitted lead as a GHL contact (`lib/ghl.ts`), tagged
`hvac-lead`, the service requested, the state, and the utm_campaign — so your call
automation workflow can trigger off those tags. Requires two env vars (set in
`.env.local` for local dev, or your host's environment settings in production —
**never commit these**):

- `GHL_API_KEY` — a GHL Private Integration token (`pit-...`), from Settings →
  Private Integrations in the sub-account, scoped to `contacts.write`/`contacts.readonly`.
- `GHL_LOCATION_ID` — the sub-account's Location ID, from Settings → Business Profile.

If either is missing, the lead still submits successfully to the visitor — the GHL
push is best-effort and only logs an error server-side, so a GHL outage or
misconfiguration never blocks someone from getting through the form.

Custom fields (e.g. zip code, exact service) aren't sent yet since GHL's field keys
are account-specific — add them to the `body` in `lib/ghl.ts` once you confirm the
keys under Settings → Custom Fields for this location.

## Creative

Two ready-to-upload 1080×1080 feed/story images are in `marketing/ads/`:

- `ac-emergency.png` — "No AC in 100° Heat?" (use with the `emergency` variant, hot-climate targeting)
- `compare-quotes.png` — "Compare Local HVAC Quotes Before You Book" (use with `default`/`savings`, broad targeting)

Both are square (1:1), which Meta safely crops for Feed, Reels, and Stories placements.

### Video ad

`marketing/ads/hvac-ad-15s.mp4` — a 15.6s, 1080×1080, silent video ad: slow Ken Burns
zoom on the emergency creative → crossfade to the compare-quotes creative → crossfade
to a closing CTA card. Built programmatically (ffmpeg) from the two static creatives
above, since no video-generation API key is configured in this environment.

- It's silent by design — Meta Feed/Reels autoplay muted by default, and all copy is
  baked into the frame as on-screen text, so it works with sound off.
- Pair it with campaign #1 (Emergency) or run it as a top-of-funnel awareness ad
  alongside the static images — video tends to get cheaper reach/CPMs on Meta than
  single images right now.
- This repo already has a real AI video generation integration built in
  (`lib/higgsfield.ts`, Higgsfield Marketing Studio — UGC/testimonial-style ad video,
  not just Ken-Burns-on-a-static-image) but it needs a `HIGGSFIELD_API_KEY` to call.
  Provide one and I can generate an actual UGC-style ad video (e.g. an AI presenter
  reacting to the AC breaking, then pitching the free quote) using the app's own
  Generate tab instead of this simpler slideshow version.

## Ad copy

### 1. Emergency / hot-climate (run now — see targeting below)

- **Primary text:** Your AC picked the worst day to break. Get matched with a licensed, local HVAC tech and a free repair quote — most homeowners hear back in under an hour.
- **Headline:** No AC in 100° Heat? Get Help Today
- **Description:** Free quote. Licensed & insured. Same-day service.
- **CTA button:** Get Quote
- **Destination:** `/hvac-leads?utm_source=meta&utm_campaign=ac_emergency_summer&utm_content=emergency`
- **Creative:** `ac-emergency.png`

### 2. Compare quotes / broad reach

- **Primary text:** Before you book a repair, see what a licensed local HVAC pro would actually charge. Free, no-obligation quotes — takes 30 seconds.
- **Headline:** Compare Local HVAC Quotes Free
- **Description:** No obligation. 4.9/5 from 2,300+ homeowners.
- **CTA button:** Learn More
- **Destination:** `/hvac-leads?utm_source=meta&utm_campaign=ac_compare_broad&utm_content=savings`
- **Creative:** `compare-quotes.png`

### 3. New system / installation (higher ticket, retarget warm audiences)

- **Primary text:** AC on its last leg? A new, efficient system could save you money every month. Get a free, no-pressure installation quote from a licensed local pro.
- **Headline:** Old AC or Furnace? Get a Free Replacement Quote
- **Description:** Financing available through local partners.
- **CTA button:** Get Quote
- **Destination:** `/hvac-leads?utm_source=meta&utm_campaign=ac_install_retarget&utm_content=install`
- **Creative:** reuse `compare-quotes.png`, or brief a third creative once this angle proves out

### 4. Furnace / cold-climate (hold for launch in Sept–Oct, see targeting below)

- **Primary text:** Don't wait for the first cold snap to find out your furnace is dead. Get a free, no-obligation quote from a licensed local HVAC pro before winter hits.
- **Headline:** Furnace Acting Up? Get Help Before Winter
- **Description:** Free quote. Licensed & insured. Fast local dispatch.
- **CTA button:** Get Quote
- **Destination:** `/hvac-leads?utm_source=meta&utm_campaign=furnace_fall_prep&utm_content=default`
- **Creative:** needs its own creative (cold/blue-toned) — build closer to launch

## Geo-targeting: where it's hot vs. cold

Today is **July 13** — peak cooling season across almost the entire country, and
too early for a heating angle to convert anywhere in the US. Recommended split:

### Run now — AC/emergency campaigns (hot states, peak heat)

Target these states/metros for campaigns #1–#3 above:

- **Arizona** — Phoenix, Tucson
- **Texas** — Houston, Dallas–Fort Worth, San Antonio, Austin
- **Florida** — Miami, Orlando, Tampa, Jacksonville
- **Nevada** — Las Vegas
- **Georgia** — Atlanta
- **Louisiana** — New Orleans, Baton Rouge
- **Alabama & Mississippi** — Birmingham, Jackson
- **South Carolina** — Columbia
- **Southern California** — Inland Empire, Coachella Valley, Sacramento Valley
- **New Mexico & Oklahoma** — Albuquerque, Oklahoma City

These regions have the highest AC failure rates and search/ad intent right now — prioritize budget here through September.

### Hold for fall — furnace campaign (cold states, launch Sept–Oct)

Prep campaign #4 to launch as temperatures drop, targeting:

- **Minnesota, Wisconsin, Michigan** — Minneapolis, Milwaukee, Detroit
- **North Dakota, South Dakota, Montana, Wyoming**
- **Maine, New Hampshire, Vermont, upstate New York**
- **Illinois, Ohio, Pennsylvania** — Chicago, Cleveland, Pittsburgh
- **Idaho, Alaska**

Don't spend on furnace messaging in these states yet — it's summer, intent is near zero. Revisit this doc in September to flip the budget split.

## Demographics & detailed targeting

Set at the **Ad Set level → Audience → Detailed Targeting** (demographics live under
the "Browse" categories there, not a separate page).

- **Age:** 30–65+. Homeownership skews older; exclude 18–24 (mostly renters).
- **Home Ownership:** Demographics → Home → **Homeowners**. This is the single
  highest-leverage filter for HVAC — it excludes renters who would never book a
  repair or install.
- **Household Income (optional):** Demographics → Home → Household Income, top 50%,
  if you want to bias campaign #3 (install/replacement) toward higher-ticket leads.
- **Life Events (use for campaign #3):** "Newly moved" / "New homeowner" — people who
  just bought a house often need HVAC service or replacement soon.
- **Interests (light layer only):** Home improvement, HVAC brands (Trane, Carrier,
  Lennox, Rheem), Angi, HomeAdvisor, Nextdoor.
- **Gender:** leave broad/all — no strong skew for HVAC decision-makers.

Start with just **Homeownership + age 30–65 + the hot-state geos above**, and let
Meta's Advantage+ audience expansion find the rest. Stacking too many manual interest
layers tends to shrink reach and raise CPMs without improving lead quality.

## Suggested initial split (now, July–Sept)

- 60% budget → Emergency/hot-climate (#1)
- 30% budget → Compare quotes/broad (#2)
- 10% budget → Install/retarget (#3), targeted at people who visited the page but didn't submit (Meta Custom Audience / retargeting pixel required)
