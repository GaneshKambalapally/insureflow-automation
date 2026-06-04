import { test as setup } from '@playwright/test';
import path from 'path';

const ADMIN_FILE        = path.join(__dirname, '../fixtures/admin.json');
const AGENT_FILE        = path.join(__dirname, '../fixtures/agent.json');
const POLICYHOLDER_FILE = path.join(__dirname, '../fixtures/policyholder.json');

// ── Save Admin Auth State ────────────────────────
setup('save admin auth state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#email').fill(
    process.env.ADMIN_EMAIL || 'admin@insureflow.com'
  );
  await page.locator('#password').fill(
    process.env.ADMIN_PASSWORD || 'Admin@123'
  );
  await page.locator('#loginBtn').click();
  await page.waitForURL('**/dashboard.html');
  await page.context().storageState({ path: ADMIN_FILE });
});

// ── Save Agent Auth State ────────────────────────
setup('save agent auth state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#email').fill(
    process.env.AGENT_EMAIL || 'agent@insureflow.com'
  );
  await page.locator('#password').fill(
    process.env.AGENT_PASSWORD || 'Agent@123'
  );
  await page.locator('#loginBtn').click();
  await page.waitForURL('**/dashboard.html');
  await page.context().storageState({ path: AGENT_FILE });
});

// ── Save Policyholder Auth State ─────────────────
setup('save policyholder auth state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.locator('#email').fill(
    process.env.POLICYHOLDER_EMAIL || 'john.doe@email.com'
  );
  await page.locator('#password').fill(
    process.env.POLICYHOLDER_PASSWORD || 'Policy@123'
  );
  await page.locator('#loginBtn').click();
  await page.waitForURL('**/dashboard.html');
  await page.context().storageState({ path: POLICYHOLDER_FILE });
});