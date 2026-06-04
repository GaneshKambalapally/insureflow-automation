import { test, expect } from "../../fixtures/auth.fixtures";
test.describe("Payment History - Functional Tests", () => {
  test.beforeEach(async ({ historyPage }) => {
    await historyPage.goto();
  });
  test("@smoke @history History page loads correctly", async ({
    historyPage,
  }) => {
    await historyPage.assertPageLoaded();
  });
  test("@smoke @history Shows seeded transactions", async ({ historyPage }) => {
    await historyPage.assertHasTransactions();
  });
  test("@regression @history Filter by success shows only success", async ({
    historyPage,
  }) => {
    await historyPage.filterByStatus("success");
    expect(await historyPage.getTransactionCount()).toBeGreaterThan(0);
    const statuses = await historyPage.getAllStatuses();
    for (const s of statuses) {
      expect(s.toLowerCase()).toBe("success");
    }
  });
  test("@regression @history Filter by failed shows only failed", async ({
    historyPage,
  }) => {
    await historyPage.filterByStatus("failed");
    expect(await historyPage.getTransactionCount()).toBeGreaterThan(0);
    const statuses = await historyPage.getAllStatuses();
    for (const s of statuses) {
      expect(s.toLowerCase()).toBe("failed");
    }
  });
  test("@regression @history Filter by NEFT method returns results", async ({
    historyPage,
  }) => {
    await historyPage.filterByMethod("NEFT");
    expect(await historyPage.getTransactionCount()).toBeGreaterThan(0);
  });
  test("@regression @history Filter by NACH method returns results", async ({
    historyPage,
  }) => {
    await historyPage.filterByMethod("NACH");
    expect(await historyPage.getTransactionCount()).toBeGreaterThan(0);
  });
  test("@regression @history Reset filters restores all transactions", async ({
    historyPage,
  }) => {
    await historyPage.filterByStatus("failed");
    const failedCount = await historyPage.getTransactionCount();
    await historyPage.resetFilters();
    expect(await historyPage.getTransactionCount()).toBeGreaterThanOrEqual(
      failedCount,
    );
  });
  test("@regression @history Receipt link visible for success payments", async ({
    historyPage,
    page,
  }) => {
    await historyPage.filterByStatus("success");
    expect(
      await page.locator('#historyBody a[href*="receipt"]').count(),
    ).toBeGreaterThan(0);
  });
  test("@regression @history No receipt link for failed payments", async ({
    historyPage,
    page,
  }) => {
    await historyPage.filterByStatus("failed");
    if ((await historyPage.getTransactionCount()) > 0) {
      expect(
        await page.locator('#historyBody a[href*="receipt"]').count(),
      ).toBe(0);
    }
  });
  test("@regression @history Transaction ref in TXN- format", async ({
    page,
  }) => {
    await page.goto("/history.html");
    await page.waitForFunction(
      () =>
        !document
          .querySelector("#historyBody")
          ?.textContent?.includes("Loading..."),
      { timeout: 10000 },
    );
    const text = await page.locator("#historyBody code").first().innerText();
    expect(text).toMatch(/TXN-/);
  });
  test('@regression @history Valid date range returns results',
  async ({ historyPage }) => {
    // Use current year range instead of 2024
    await historyPage.filterByDateRange('2026-01-01', '2026-12-31');
    expect(await historyPage.getTransactionCount()).toBeGreaterThan(0);
});
  test("@regression @history Future date range returns no results", async ({
    historyPage,
  }) => {
    await historyPage.filterByDateRange("2030-01-01", "2030-12-31");
    await historyPage.assertNoTransactionsFound();
  });
});
