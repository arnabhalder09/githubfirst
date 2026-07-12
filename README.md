# ghl-lead-scraper

Finds local businesses that have no website, for cold-outreach lead lists
(built for feeding a GoHighLevel pipeline).

Queries the Google Places API for a niche + location, filters out results
that already have a website, and surfaces name/phone/address/rating. A
bulk mode scans many cities at once with live progress via server-sent
events.

Extracted from the `githubfirst` monorepo, where it was originally built
alongside an unrelated Higgsfield video-editing app — this tool has no
dependency on that codebase.

## Structure

- `app/api/places/route.ts` — single city/niche search
- `app/api/places/bulk/route.ts` — multi-city scan with SSE progress
- `app/scraper/page.tsx` — the scraper UI (redirected to from `/`)

## Setup

```bash
npm install
cp .env.example .env.local   # add your GOOGLE_PLACES_API_KEY
npm run dev
```
