import { test as setup } from '@playwright/test';
import path from 'path';

const ADMIN_FILE        = path.join(__dirname, '../fixtures/admin.json');
const AGENT_FILE        = path.join(__dirname, '../fixtures/agent.json');
const POLICYHOLDER_FILE = path.join(__dirname, '../fixtures/policyholder.json');

async function loginAndSave(
  page: any,
  email: string,
  password: string,
  filePath: string
) {
  await page.goto(process.env.BASE_URL || 'http://localhost:3000');

  // Wait for login form to be ready
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  // Intercept login API response
  const [response] = await Promise.all([
    page.waitForResponse(
      (res: any) => res.url().includes('/auth/login'),
      { timeout: 15000 }
    ),
    page.locator('#loginBtn').click(),
  ]);

  const body = await response.json();

  if (!body.success) {
    throw new Error(`Login failed for ${email}: ${body.message}`);
  }

  // Wait for dashboard
  await page.waitForURL('**/dashboard.html', { timeout: 30000 });

  // Save auth state
  await page.context().storageState({ path: filePath });
  console.log(`✅ Auth state saved for ${email}`);
}

setup('save admin auth state', async ({ page }) => {
  await loginAndSave(
    page,
    process.env.ADMIN_EMAIL        || 'admin@insureflow.com',
    process.env.ADMIN_PASSWORD      || 'Admin@123',
    ADMIN_FILE
  );
});

setup('save agent auth state', async ({ page }) => {
  await loginAndSave(
    page,
    process.env.AGENT_EMAIL        || 'agent@insureflow.com',
    process.env.AGENT_PASSWORD      || 'Agent@123',
    AGENT_FILE
  );
});

setup('save policyholder auth state', async ({ page }) => {
  await loginAndSave(
    page,
    process.env.POLICYHOLDER_EMAIL  || 'john.doe@email.com',
    process.env.POLICYHOLDER_PASSWORD || 'Policy@123',
    POLICYHOLDER_FILE
  );
});