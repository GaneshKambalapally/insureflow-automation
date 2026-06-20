import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object for Login page
 * URL: http://localhost:3000 (index.html)
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput:     Locator;
  readonly passwordInput:  Locator;
  readonly loginButton:    Locator;
  readonly alertBox:       Locator;
  readonly logoHeading:    Locator;
  readonly demoCredsBox:   Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput    = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#loginBtn');
    this.alertBox      = page.locator('#alertBox .alert-error');
    this.logoHeading   = page.locator('.login-logo h1');
    this.demoCredsBox  = page.locator('.demo-creds');
  }

  // ── Actions ─────────────────────────────────────────────

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.navigate('/');
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Login as Admin
   */
  async loginAsAdmin(): Promise<void> {
    await this.login(
      process.env.ADMIN_EMAIL    || 'admin@insureflow.com',
      process.env.ADMIN_PASSWORD || 'Admin@123'
    );
    await this.page.waitForURL('**/dashboard.html');
  }

  /**
   * Login as Agent
   */
  async loginAsAgent(): Promise<void> {
    await this.login(
      process.env.AGENT_EMAIL    || 'agent@insureflow.com',
      process.env.AGENT_PASSWORD || 'Agent@123'
    );
    await this.page.waitForURL('**/dashboard.html');
  }

  /**
   * Login as Policyholder
   */
  async loginAsPolicyholder(): Promise<void> {
    await this.login(
      process.env.POLICYHOLDER_EMAIL    || 'john.doe@email.com',
      process.env.POLICYHOLDER_PASSWORD || 'Policy@123'
    );
    await this.page.waitForURL('**/dashboard.html');
  }

  /**
   * Get error message from alert box
   */
  async getErrorMessage(): Promise<string> {
  await this.page.locator('#alertBox .alert-error')
    .waitFor({ state: 'visible', timeout: 8000 });
  return await this.page
    .locator('#alertBox .alert-error')
    .innerText();
}

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  // ── Assertions ──────────────────────────────────────────

  /**
   * Assert login page is loaded
   */
  async assertPageLoaded(): Promise<void> {
    await expect(this.logoHeading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Assert logo text
   */
  async assertLogoText(): Promise<void> {
    await expect(this.logoHeading).toContainText('InsureFlow');
  }

  /**
   * Assert demo credentials are shown
   */
  async assertDemoCredsVisible(): Promise<void> {
    await expect(this.demoCredsBox).toBeVisible();
  }


  /**
   * Assert redirect to dashboard after login
   */
  async assertRedirectToDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\.html/);
  }

async assertErrorMessage(expected: string): Promise<void> {
  let capturedBody: any = null;

  await this.page.route('**/auth/login', async route => {
    const response = await route.fetch();
    capturedBody = await response.json();
    await route.fulfill({ response });
  });

  await this.loginButton.click();

  await this.page.waitForTimeout(2000);

  await this.page.unroute('**/auth/login');

  expect(capturedBody).not.toBeNull();
  expect(capturedBody.success).toBe(false);
  expect(capturedBody.message).toContain(expected);
}
async assertBrowserValidationBlocks(): Promise<void> {
  // Browser HTML5 validation prevents submission
  // Form is invalid — no API call made
  // Verify we are still on login page
  await expect(this.page).toHaveURL(/localhost:\d+\/?$/);
  await expect(this.emailInput).toBeVisible();
}
}
