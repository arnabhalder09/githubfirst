# meta-lookalike-bot

Playwright automation that logs into Meta Ads Manager and creates a Lookalike
Audience from a source custom audience, driven via a GitHub Action
(`workflow_dispatch`).

## Setup

```bash
cd meta-lookalike-bot
npm install
npx playwright install chromium
cp .env.example .env   # fill in AD_ACCOUNT_ID etc.
```

Run `auth/save-auth.ts` once locally to capture a logged-in Meta session,
then base64-encode `auth/meta-session.json` into the `META_SESSION_B64`
GitHub Actions secret (plus `AD_ACCOUNT_ID`) to enable the workflow.

## Usage

```bash
npm run create
```

Or trigger the **Create Meta Lookalike Audience** workflow manually from the
Actions tab with your desired source audience, target countries, and size.
