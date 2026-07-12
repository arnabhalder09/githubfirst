import { chromium, BrowserContext, Page } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SESSION_PATH = path.resolve(__dirname, '../auth/meta-session.json');

const SOURCE_AUDIENCE_NAME = process.env.SOURCE_AUDIENCE_NAME ?? 'Purchasers';
const TARGET_COUNTRIES = (process.env.TARGET_COUNTRIES ?? 'United States').split(',').map((c) => c.trim());
const AUDIENCE_SIZE = parseInt(process.env.AUDIENCE_SIZE ?? '1', 10);
const AD_ACCOUNT_ID = process.env.AD_ACCOUNT_ID ?? '';
const HEADLESS = process.env.HEADLESS !== 'false';
const SLOW_MO = parseInt(process.env.SLOW_MO ?? '200', 10);

const AUDIENCES_URL = AD_ACCOUNT_ID
  ? `https://adsmanager.facebook.com/adsmanager/audiences?act=${AD_ACCOUNT_ID}`
  : 'https://adsmanager.facebook.com/adsmanager/audiences';

function log(level: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${level}] ${msg}`);
}

async function dismissModals(page: Page) {
  const dismissSelectors = [
    '[aria-label="Close"]',
    'button:has-text("Not now")',
    'button:has-text("Maybe later")',
    'button:has-text("Got it")',
    'button:has-text("Dismiss")',
  ];
  for (const sel of dismissSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 })) {
        await el.click({ timeout: 1500 });
        log('INFO', `Dismissed modal via: ${sel}`);
      }
    } catch {
      // no modal with this selector — continue
    }
  }
}

async function selectDropdownOption(page: Page, inputSelector: string, value: string) {
  const input = page.locator(inputSelector).first();
  await input.fill(value);
  await page.waitForTimeout(1000);

  // Try role option first
  try {
    const option = page.getByRole('option', { name: new RegExp(value, 'i') }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
    return;
  } catch {
    // fall through to li fallback
  }

  // Fallback: li element containing the text
  try {
    const li = page.locator(`li:has-text("${value}")`).first();
    await li.waitFor({ state: 'visible', timeout: 3000 });
    await li.click();
    return;
  } catch {
    throw new Error(`Could not find dropdown option for: "${value}"`);
  }
}

async function setRangeSlider(page: Page, value: number) {
  const slider = page.locator('input[type="range"]').first();
  try {
    await slider.waitFor({ state: 'visible', timeout: 3000 });
    await page.evaluate(
      ({ sel, val }: { sel: string; val: number }) => {
        const el = document.querySelector(sel) as HTMLInputElement | null;
        if (!el) return;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        nativeInputValueSetter?.call(el, String(val));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      },
      { sel: 'input[type="range"]', val: value }
    );
    log('✓', `Set range slider to ${value}`);
    return;
  } catch {
    // fall through to number input
  }

  // Fallback: number input
  try {
    const numInput = page.locator('input[type="number"]').first();
    await numInput.waitFor({ state: 'visible', timeout: 3000 });
    await numInput.fill(String(value));
    log('✓', `Set number input to ${value}`);
  } catch {
    log('WARN', 'Could not find slider or number input for audience size — skipping');
  }
}

async function main() {
  // ── Step 1: Auth ──────────────────────────────────────────────────────────
  log('INFO', 'Step 1 — Loading session...');

  if (!fs.existsSync(SESSION_PATH)) {
    throw new Error('No session found. Run "npm run save-auth" first.');
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
  });

  let context: BrowserContext | undefined;
  let page: Page | undefined;

  try {
    context = await browser.newContext({
      storageState: SESSION_PATH,
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    // Block analytics/beacon routes
    await context.route(/\/(beacon|analytics|logging|graphql\/logging)/, (route) => route.abort());

    page = await context.newPage();
    log('✓', 'Browser launched with saved session');

    // ── Step 2: Navigate ───────────────────────────────────────────────────
    log('INFO', 'Step 2 — Navigating to Audiences...');
    await page.goto(AUDIENCES_URL);

    if (page.url().includes('login')) {
      throw new Error('Session expired — delete auth/meta-session.json and re-run "npm run save-auth"');
    }

    await page.waitForLoadState('networkidle');
    log('✓', 'Audiences page loaded');

    await dismissModals(page);

    // ── Step 3: Open Lookalike modal ───────────────────────────────────────
    log('INFO', 'Step 3 — Opening Lookalike Audience modal...');

    await page.getByRole('button', { name: /create audience/i }).first().click();
    log('INFO', 'Clicked "Create Audience" button');

    await page.getByRole('menuitem', { name: /lookalike audience/i }).click();
    log('INFO', 'Clicked "Lookalike Audience" menu item');

    await page.waitForLoadState('networkidle');
    await dismissModals(page);
    log('✓', 'Lookalike modal opened');

    // ── Step 4: Source Audience ────────────────────────────────────────────
    log('INFO', `Step 4 — Selecting source audience: "${SOURCE_AUDIENCE_NAME}"...`);

    const sourceSelector = '[placeholder*="Search"],[aria-label*="source"],[aria-label*="Source"]';
    await selectDropdownOption(page, sourceSelector, SOURCE_AUDIENCE_NAME);
    log('✓', `Source audience selected: "${SOURCE_AUDIENCE_NAME}"`);

    // ── Step 5: Target Countries ───────────────────────────────────────────
    log('INFO', `Step 5 — Adding target countries: ${TARGET_COUNTRIES.join(', ')}...`);

    for (const country of TARGET_COUNTRIES) {
      log('INFO', `  Adding country: "${country}"`);
      const countrySelector =
        '[placeholder*="Search countries"],[placeholder*="search countries"],[aria-label*="country"],[aria-label*="Country"]';
      await selectDropdownOption(page, countrySelector, country);
      await page.waitForTimeout(800);
      log('✓', `  Added: "${country}"`);
    }

    // ── Step 6: Audience Size ──────────────────────────────────────────────
    log('INFO', `Step 6 — Setting audience size to ${AUDIENCE_SIZE}%...`);
    await setRangeSlider(page, AUDIENCE_SIZE);

    // ── Step 7: Submit ─────────────────────────────────────────────────────
    log('INFO', 'Step 7 — Submitting...');

    await page.getByRole('button', { name: /^create audience$/i }).last().click();
    log('INFO', 'Clicked "Create Audience" submit button');

    // Wait for success confirmation
    let success = false;
    try {
      await page.waitForSelector(
        'text="successfully", text="being created", text="Audience created"',
        { timeout: 20_000 }
      );
      success = true;
    } catch {
      // Check if the modal closed — also counts as success
      const dialogVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
      if (!dialogVisible) {
        success = true;
        log('INFO', 'Dialog closed — treating as success');
      }
    }

    if (!success) {
      throw new Error('Audience creation did not confirm within timeout — check error-screenshot.png');
    }

    log('✓', 'Lookalike audience created successfully!');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log('ERROR', message);

    if (page) {
      try {
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
        log('INFO', 'Error screenshot saved to error-screenshot.png');
      } catch {
        log('WARN', 'Could not save error screenshot');
      }
    }

    throw err;
  } finally {
    // Always save refreshed session state
    if (context) {
      try {
        await context.storageState({ path: SESSION_PATH });
        log('INFO', 'Session state refreshed');
      } catch {
        log('WARN', 'Could not refresh session state');
      }
    }

    await browser.close();
    log('INFO', 'Browser closed');
  }
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${new Date().toISOString()}] [ERROR] Fatal: ${message}`);
  process.exit(1);
});
