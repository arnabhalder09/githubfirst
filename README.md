# HVAC Leads Landing

A standalone Next.js lead-capture landing page built to be the click-through
destination for a Meta Ads campaign targeting US homeowners searching for
HVAC (AC/furnace) repair and installation.

## What's here

- `app/page.tsx` — the landing page: hero, trust badges, services, "how it
  works", and the lead form.
- `app/components/HvacLeadForm.tsx` — client-side form (name, phone, email,
  zip, state, service needed) with validation and a success state. Captures
  `utm_source` / `utm_campaign` / `utm_content` from the URL for ad
  attribution.
- `app/api/hvac-leads/route.ts` — server-side validation endpoint that
  receives form submissions. Currently logs each lead; swap in a real
  CRM/webhook integration (and the Meta Conversions API "Lead" event) for
  production use.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying for a live campaign

1. Deploy (e.g. to Vercel) and point your Meta ad's destination URL at the
   deployed domain, with UTM parameters appended
   (`?utm_source=meta&utm_campaign=...`).
2. Wire `app/api/hvac-leads/route.ts` up to your CRM and/or the Meta
   Conversions API so lead events are tracked server-side.
3. Add a Meta Pixel for client-side `PageView`/`Lead` tracking if desired.
