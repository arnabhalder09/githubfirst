import { chromium } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SESSION_PATH = path.resolve(__dirname, 'meta-session.json');

function log(level: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${level}] ${msg}`);
}

async function main() {
  log('INFO', 'Launching browser for manual login...');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.facebook.com/login');
  log('INFO', 'Navigated to Facebook login page');

  const email = process.env.FB_EMAIL;
  const password = process.env.FB_PASSWORD;

  if (email && password) {
    log('INFO', 'Auto-filling credentials from env...');
    await page.fill('#email', email);
    await page.fill('#pass', password);
    await page.click('[name="login"]');
    log('INFO', 'Credentials submitted — complete 2FA if prompted');
  } else {
    log('INFO', 'No credentials in env — please log in manually in the browser window');
  }

  log('INFO', 'Waiting up to 3 minutes for successful login (complete 2FA if needed)...');

  try {
    await page.waitForURL('https://www.facebook.com/', { timeout: 180_000 });
    log('✓', 'Login detected — saving session');
  } catch {
    log('WARN', 'Timed out waiting for home URL — saving whatever session state exists');
  }

  const authDir = path.dirname(SESSION_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await context.storageState({ path: SESSION_PATH });
  log('✓', `Session saved to ${SESSION_PATH}`);

  await browser.close();
  log('INFO', 'Browser closed. Run "npm run create" to start the automation.');
}

main().catch((err) => {
  console.error(`[${new Date().toISOString()}] [ERROR] ${err.message}`);
  process.exit(1);
});
