import { test, expect } from "../../fixtures/auth.fixtures";
import testData from "../../fixtures/testData.json";
import { FakerHelper } from "../../utils/fakerHelper";
test.describe("Claims Management - Functional Tests", () => {
  test.beforeEach(async ({ claimsPage }) => {
    await claimsPage.goto();
  });
  test("@smoke @claims Claims page loads with table", async ({
    claimsPage,
  }) => {
    await claimsPage.assertPageLoaded();
  });
  test("@smoke @claims Claims table has seeded data", async ({
    claimsPage,
  }) => {
    await claimsPage.assertClaimsTableHasData();
  });
  test("@smoke @claims Raise Claim button visible for admin", async ({
    claimsPage,
  }) => {
    await expect(claimsPage.raiseClaimBtn).toBeVisible();
  });
  test("@regression @claims Raise claim modal opens", async ({
    claimsPage,
  }) => {
    await claimsPage.openRaiseClaimModal();
    await expect(claimsPage.raiseModal).toHaveClass(/active/);
  });
  test("@regression @claims Policy dropdown in modal has options", async ({
    claimsPage,
    page,
  }) => {
    await claimsPage.openRaiseClaimModal();
    expect(await page.locator("#claimPolicy option").count()).toBeGreaterThan(
      1,
    );
  });
  test("@regression @claims Raise Hospitalization claim", async ({
    claimsPage,
  }) => {
    await claimsPage.raiseClaim({
      policyIndex: 1,
      amount: testData.claims.valid.amount,
      reason: "Hospitalization",
      description: FakerHelper.generateClaimDescription(),
    });
    await claimsPage.assertClaimRaisedSuccessfully();
  });
  test("@regression @claims Raise Accident damage claim", async ({
    claimsPage,
  }) => {
    await claimsPage.raiseClaim({
      policyIndex: 1,
      amount: testData.claims.motor.amount,
      reason: "Accident damage",
      description: FakerHelper.generateClaimDescription(),
    });
    await claimsPage.assertClaimRaisedSuccessfully();
  });
  test("@regression @claims Raise Theft claim", async ({ claimsPage }) => {
    await claimsPage.raiseClaim({
      policyIndex: 1,
      amount: "25000",
      reason: "Theft",
    });
    await claimsPage.assertClaimRaisedSuccessfully();
  });
  test("@regression @claims Cancel closes raise modal", async ({
    claimsPage,
    page,
  }) => {
    await claimsPage.openRaiseClaimModal();
    await page.locator("#raiseModal .btn-outline").click();
    await expect(claimsPage.raiseModal).not.toHaveClass(/active/);
  });
  test("@regression @claims Table shows required columns", async ({ page }) => {
    for (const h of ["Claim No.", "Policy", "Amount", "Status", "Filed"]) {
      await expect(page.locator("thead")).toContainText(h);
    }
  });
  test("@regression @claims Status badges visible in table", async ({
    page,
  }) => {
    expect(await page.locator("#claimsBody .badge").count()).toBeGreaterThan(0);
  });
  test("@regression @claims Admin sees Approve button", async ({ page }) => {
    await expect(
      page.locator('#claimsBody button:has-text("Approve")').first(),
    ).toBeVisible();
  });
  test("@regression @claims Disbursed claims badge shown", async ({ page }) => {
    const badge = page
      .locator("#claimsBody .badge")
      .filter({ hasText: "disbursed" });
    await expect(badge.first()).toBeVisible();
  });
  // nn NEGATIVE TESTS nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
  test("@regression @claims Form blocked without policy selection", async ({
    claimsPage,
    page,
  }) => {
    await claimsPage.openRaiseClaimModal();
    await claimsPage.claimAmount.fill("50000");
    await claimsPage.claimReason.selectOption({ label: "Hospitalization" });
    await claimsPage.submitClaimBtn.click();
    const isInvalid = await page.evaluate(() => {
      const el = document.querySelector("#claimPolicy") as HTMLSelectElement;
      return !el.validity.valid;
    });
    expect(isInvalid).toBe(true);
  });
  test("@regression @claims Form blocked without amount", async ({
    claimsPage,
    page,
  }) => {
    await claimsPage.openRaiseClaimModal();
    await claimsPage.claimPolicySelect.selectOption({ index: 1 });
    await claimsPage.claimReason.selectOption({ label: "Theft" });
    await claimsPage.submitClaimBtn.click();
    const isInvalid = await page.evaluate(() => {
      const el = document.querySelector("#claimAmount") as HTMLInputElement;
      return !el.validity.valid;
    });
    expect(isInvalid).toBe(true);
  });
});
