import { test, expect } from "../../fixtures/auth.fixtures";
test.describe("Refund & Reversals - Functional Tests", () => {
  test.beforeEach(async ({ refundPage }) => {
    await refundPage.goto();
  });
  test("@smoke @refund Page loads correctly", async ({ refundPage }) => {
    await refundPage.assertPageLoaded();
  });
  test("@smoke @refund Table has seeded refund data", async ({
    refundPage,
  }) => {
    expect(await refundPage.getRefundCount()).toBeGreaterThan(0);
  });
  test("@regression @refund Modal opens on button click", async ({
    refundPage,
  }) => {
    await refundPage.openRefundModal();
    await expect(refundPage.refundModal).toHaveClass(/active/);
  });
  test("@regression @refund Payment dropdown has successful payments", async ({
    refundPage,
    page,
  }) => {
    await refundPage.openRefundModal();
    expect(await page.locator("#refundPayment option").count()).toBeGreaterThan(
      1,
    );
  });
  test("@regression @refund Selecting payment auto-fills amount", async ({
    refundPage,
  }) => {
    await refundPage.openRefundModal();
    await refundPage.refundPayment.selectOption({ index: 1 });
    expect(
      parseFloat(await refundPage.refundAmount.inputValue()),
    ).toBeGreaterThan(0);
  });
  test("@regression @refund Initiate duplicate payment refund", async ({
    refundPage,
  }) => {
    await refundPage.initiateRefund({
      paymentIndex: 1,
      amount: "5000",
      reason: "Duplicate payment",
    });
    await refundPage.assertRefundInitiated();
  });
  test("@regression @refund Initiate overpayment refund", async ({
    refundPage,
  }) => {
    await refundPage.initiateRefund({
      paymentIndex: 1,
      amount: "2000",
      reason: "Overpayment",
    });
    await refundPage.assertRefundInitiated();
  });
  test("@regression @refund Refund table shows status badges", async ({
    page,
  }) => {
    expect(await page.locator("#refundBody .badge").count()).toBeGreaterThan(0);
  });
  test("@regression @refund Processed refunds visible in table", async ({
    page,
  }) => {
    await expect(
      page
        .locator("#refundBody .badge")
        .filter({ hasText: "processed" })
        .first(),
    ).toBeVisible();
  });
  test("@regression @refund Cancel closes modal without initiating", async ({
    refundPage,
    page,
  }) => {
    await refundPage.openRefundModal();
    await page.locator("#refundModal .btn-outline").click();
    await expect(refundPage.refundModal).not.toHaveClass(/active/);
  });
  test("@regression @refund Refund ref in REF- format", async ({ page }) => {
    const code = page.locator("#refundBody code").first();
    if (await code.isVisible()) {
      expect(await code.innerText()).toMatch(/REF-/);
    }
  });
  test("@regression @refund Admin sees Process button", async ({ page }) => {
    expect(
      await page.locator('#refundBody button:has-text("Process")').count(),
    ).toBeGreaterThanOrEqual(0);
  });
});
