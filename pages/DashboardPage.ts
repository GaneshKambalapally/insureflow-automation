import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
export class DashboardPage extends BasePage {
  readonly statPolicies: Locator;
  readonly statPayments: Locator;
  readonly statPending: Locator;
  readonly statFailed: Locator;
  readonly policiesList: Locator;
  readonly recentPayments: Locator;
  readonly dueAlerts: Locator;
  readonly welcomeMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.statPolicies = page.locator("#statPolicies");
    this.statPayments = page.locator("#statPayments");
    this.statPending = page.locator("#statPending");
    this.statFailed = page.locator("#statFailed");
    this.policiesList = page.locator("#policiesList");
    this.recentPayments = page.locator("#recentPayments");
    this.dueAlerts = page.locator("#dueAlerts");
    this.welcomeMsg = page.locator("#welcomeMsg");
  }

  async goto(): Promise<void> {
    await this.navigate("/dashboard.html");
    await this.page.waitForFunction(
      () =>
        !document
          .querySelector("#policiesList")
          ?.textContent?.includes("Loading..."),
    );
  }

  async getPoliciesCount(): Promise<string> {
    await this.page.waitForFunction(
      () => document.querySelector("#statPolicies")?.textContent !== "—",
    );
    return await this.statPolicies.innerText();
  }
  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMsg.innerText();
  }

  async assertDashboardLoaded(): Promise<void> {
    await expect(this.page.locator(".page-title")).toContainText("Dashboard");
    await expect(this.statPolicies).toBeVisible();
    await expect(this.statPayments).toBeVisible();
    await expect(this.policiesList).toBeVisible();
    await expect(this.recentPayments).toBeVisible();
  }
  async assertWelcomeMessageContains(name: string): Promise<void> {
    await expect(this.welcomeMsg).toContainText(name);
    // name = 'Admin User' or 'John Doe' depending on who logged in
  }
  async assertPoliciesCountIsPositive(): Promise<void> {
    const count = await this.getPoliciesCount();
    expect(parseInt(count)).toBeGreaterThan(0);
  }
  async assertSidebarVisible(): Promise<void> {
    await expect(this.page.locator(".sidebar")).toBeVisible();
    await expect(this.page.locator(".sidebar-logo h1")).toContainText(
      "InsureFlow",
    );
  }
}
