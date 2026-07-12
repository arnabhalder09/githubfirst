# linkedin-audience-tool

Analyzes a LinkedIn `Connections.csv` export into a PII-free audience
profile (top companies, titles, seniority, job functions, growth over
time), then streams AI-drafted LinkedIn post copy tailored to that
audience via Claude.

Extracted from the `githubfirst` monorepo, where it was originally built
alongside an unrelated Higgsfield video-editing app — this tool has no
dependency on that codebase.

## Structure

- `lib/linkedin/parse.ts` — parses LinkedIn's `Connections.csv` export format
- `lib/linkedin/segment.ts` — aggregates connections into an `AudienceProfile`
- `lib/linkedin/posts.ts` — streams post drafts from Claude given a profile + topic
- `app/api/linkedin/posts/route.ts` — POST endpoint wrapping `streamPostDrafts`

## Setup

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

## API

```
POST /api/linkedin/posts
{ "profile": AudienceProfile, "topic": string, "count"?: number }
```

Streams post drafts as they're generated.
