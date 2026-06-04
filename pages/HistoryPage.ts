import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
export class HistoryPage extends BasePage {
  readonly filterStatus: Locator;
  readonly filterMethod: Locator;
  readonly filterFrom: Locator;
  readonly filterTo: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly historyBody: Locator;
  constructor(page: Page) {
    super(page);
    this.filterStatus = page.locator("#filterStatus");
    this.filterMethod = page.locator("#filterMethod");
    this.filterFrom = page.locator("#filterFrom");
    this.filterTo = page.locator("#filterTo");
    this.searchButton = page.locator('button:has-text("Search")');
    this.resetButton = page.locator('button:has-text("Reset")');
    this.historyBody = page.locator("#historyBody");
  }
  async goto(): Promise<void> {
    await this.navigate("/history.html");
    await this.historyBody.waitFor({ state: "visible" });
    await this.page.waitForFunction(
      () =>
        !document
          .querySelector("#historyBody")
          ?.textContent?.includes("Loading..."),
      { timeout: 10000 },
    );
  }
  async filterByStatus(status: string): Promise<void> {
    await this.filterStatus.selectOption(status);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }
  async filterByMethod(method: string): Promise<void> {
    await this.filterMethod.selectOption(method);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }
  async filterByDateRange(from: string, to: string): Promise<void> {
    await this.filterFrom.fill(from);
    await this.filterTo.fill(to);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }
  async resetFilters(): Promise<void> {
    await this.resetButton.click();
    await this.page.waitForTimeout(500);
  }
  async getTransactionCount(): Promise<number> {
    const text = await this.historyBody.innerText();
    if (text.includes("No payments found")) return 0;
    return await this.historyBody.locator("tr").count();
  }
  async getAllStatuses(): Promise<string[]> {
  await this.page.waitForSelector('#historyBody tr', { timeout: 8000 });
  return await this.page
    .locator('#historyBody tr td:nth-child(6)')
    .allInnerTexts();
}
  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator(".page-title")).toContainText(
      "Payment History",
    );
    await expect(this.filterStatus).toBeVisible();
  }
  async assertHasTransactions(): Promise<void> {
    expect(await this.getTransactionCount()).toBeGreaterThan(0);
  }
  async assertNoTransactionsFound(): Promise<void> {
    await expect(this.historyBody).toContainText("No payments found");
  }
}
