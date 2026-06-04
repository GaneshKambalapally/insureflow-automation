import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
export class RefundPage extends BasePage {
  readonly initiateRefundBtn: Locator;
  readonly refundBody: Locator;
  readonly refundModal: Locator;
  readonly refundPayment: Locator;
  readonly refundAmount: Locator;
  readonly refundReason: Locator;
  readonly submitRefundBtn: Locator;
  constructor(page: Page) {
    super(page);
   this.initiateRefundBtn = page.locator('button[onclick="openRefundModal()"]');
    this.refundBody = page.locator('.card .table-wrapper table tbody');
    this.refundModal = page.locator("#refundModal");
    this.refundPayment = page.locator("#refundPayment");
    this.refundAmount = page.locator("#refundAmount");
    this.refundReason = page.locator("#refundReason");
    this.submitRefundBtn = page.locator('#refundForm button[type="submit"]');
  }
  async goto(): Promise<void> {
  await this.navigate('/refund.html');
  await this.page.waitForFunction(
    () => {
      const table = document.querySelector('.card .table-wrapper table tbody');
      return table !== null;
    },
    { timeout: 10000 }
  );
}
  async openRefundModal(): Promise<void> {
    await this.initiateRefundBtn.click();
    await this.refundModal.waitFor({ state: "visible" });
    await this.page.waitForFunction(
      () =>
        (document.querySelector("#refundPayment") as HTMLSelectElement)?.options
          .length > 1,
      );
  }
  async initiateRefund(data: {
  paymentIndex: number;
  amount: string;
  reason: string;
}): Promise<void> {
  // Step 1: Open modal first
  await this.initiateRefundBtn.click();

  // Step 2: Wait for modal to be visible
  await this.page.locator('.modal-overlay.active')
    .waitFor({ state: 'visible', timeout: 5000 });

  // Step 3: Wait for payment dropdown to load
  await this.page.waitForFunction(
    () => {
      const sel = document.querySelector('#refundPayment') as HTMLSelectElement;
      return sel && sel.options.length > 1;
    },
    { timeout: 10000 }
  );

  // Step 4: Fill form
  await this.refundPayment.selectOption({ index: data.paymentIndex });
  await this.refundAmount.fill(data.amount);
  await this.refundReason.selectOption({ label: data.reason });
  await this.submitRefundBtn.click();
}
  async getRefundCount(): Promise<number> {
    const text = await this.refundBody.innerText();
    if (text.includes("No refunds found")) return 0;
    return await this.refundBody.locator("tr").count();
  }
  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator(".page-title")).toContainText("Refund");
    await expect(this.initiateRefundBtn).toBeVisible();
  }
  async assertRefundInitiated(): Promise<void> {
    await this.waitForSuccessToast();
    const msg = await this.getToastMessages();
    expect(msg).toContain("initiated");
  }
}
