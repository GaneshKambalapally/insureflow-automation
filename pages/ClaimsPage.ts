import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
export class ClaimsPage extends BasePage {
  readonly raiseClaimBtn: Locator;
  readonly claimsBody: Locator;
  readonly raiseModal: Locator;
  readonly claimPolicySelect: Locator;
  readonly claimAmount: Locator;
  readonly claimReason: Locator;
  readonly claimDesc: Locator;
  readonly submitClaimBtn: Locator;
  readonly actionModal: Locator;
  readonly actionConfirmBtn: Locator;
  constructor(page: Page) {
    super(page);
    this.raiseClaimBtn = page.locator('button:has-text("Raise Claim")');
    this.claimsBody = page.locator("#claimsBody");
    this.raiseModal = page.locator("#raiseModal");
    this.claimPolicySelect = page.locator("#claimPolicy");
    this.claimAmount = page.locator("#claimAmount");
    this.claimReason = page.locator("#claimReason");
    this.claimDesc = page.locator("#claimDesc");
    this.submitClaimBtn = page.locator('#raiseForm button[type="submit"]');
    this.actionModal = page.locator("#actionModal");
    this.actionConfirmBtn = page.locator("#actionConfirmBtn");
  }
  async goto(): Promise<void> {
    await this.navigate("/claims.html");
    await this.claimsBody.waitFor({ state: "visible" });
    await this.page.waitForFunction(
      () =>
        !document
          .querySelector("#claimsBody")
          ?.textContent?.includes("Loading..."),
      { timeout: 8000 },
    );
  }
  async openRaiseClaimModal(): Promise<void> {
    await this.raiseClaimBtn.click();
    await this.raiseModal.waitFor({ state: "visible" });
    // Wait for modal to appear
    await this.page.waitForFunction(
      () =>
        (document.querySelector("#claimPolicy") as HTMLSelectElement)?.options
          .length > 1,
    );
  }
  async raiseClaim(data: {
    policyIndex: number;
    amount: string;
    reason: string;
    description?: string;
  }): Promise<void> {
    await this.openRaiseClaimModal();
    await this.claimPolicySelect.selectOption({ index: data.policyIndex });
    await this.claimAmount.fill(data.amount);
    await this.claimReason.selectOption({ label: data.reason });
    if (data.description) {
      await this.claimDesc.fill(data.description);
    }
    await this.submitClaimBtn.click();
  }
  async approveClaim(rowIndex: number): Promise<void> {
    const row = this.claimsBody.locator("tr").nth(rowIndex);
    await row.locator('button:has-text("Approve")').click();
    await this.actionModal.waitFor({ state: "visible" });
    await this.actionConfirmBtn.click();
  }
  async rejectClaim(rowIndex: number, reason: string): Promise<void> {
    const row = this.claimsBody.locator("tr").nth(rowIndex);
    await row.locator('button:has-text("Reject")').click();
    await this.actionModal.waitFor({ state: "visible" });
    await this.page.locator("#rejectReason").fill(reason);
    await this.actionConfirmBtn.click();
  }
  async getClaimCount(): Promise<number> {
    const text = await this.claimsBody.innerText();
    if (text.includes("No claims found")) return 0;
    return await this.claimsBody.locator("tr").count();
  }
  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator(".page-title")).toContainText("Claims");
    await expect(this.raiseClaimBtn).toBeVisible();
  }
  async assertClaimsTableHasData(): Promise<void> {
    expect(await this.getClaimCount()).toBeGreaterThan(0);
  }
  async assertClaimRaisedSuccessfully(): Promise<void> {
    await this.waitForSuccessToast();
    const msg = await this.getToastMessages();
    expect(msg).toContain("successfully");
  }
}
