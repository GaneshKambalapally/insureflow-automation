import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * PaymentPage - Page Object for Premium Payment page
 * URL: /payment.html
 */
export class PaymentPage extends BasePage {
  readonly policySelect:    Locator;
  readonly amountInput:     Locator;
  readonly paymentMethod:   Locator;
  readonly remarksInput:    Locator;
  readonly payButton:       Locator;
  readonly confirmModal:    Locator;
  readonly confirmButton:   Locator;
  readonly cancelButton:    Locator;
  readonly resultCard:      Locator;
  readonly paymentResult:   Locator;
  readonly failedPayments:  Locator;
  readonly policyDetails:   Locator;

  constructor(page: Page) {
    super(page);
    this.policySelect   = page.locator('#policySelect');
    this.amountInput    = page.locator('#amount');
    this.paymentMethod  = page.locator('#paymentMethod');
    this.remarksInput   = page.locator('#remarks');
    this.payButton      = page.locator('#payBtn');
    this.confirmModal   = page.locator('#confirmModal');
    this.confirmButton  = page.locator('#confirmBtn');
    this.cancelButton   = page.locator('.modal-overlay .btn-outline');
    this.resultCard     = page.locator('#resultCard');
    this.paymentResult  = page.locator('#paymentResult');
    this.failedPayments = page.locator('#failedPayments');
    this.policyDetails  = page.locator('#policyDetails');
  }

  async goto(): Promise<void> {
    await this.navigate('/payment.html');
    await this.policySelect.waitFor({ state: 'visible' });
    // Wait for policies to load in dropdown
    await this.page.waitForFunction(
      () => (document.querySelector('#policySelect') as HTMLSelectElement)?.options.length > 1,
      { timeout: 8000 }
    );
  }

  /**
   * Select a policy from dropdown by index
   */
  async selectPolicyByIndex(index: number): Promise<void> {
    const options = await this.policySelect.locator('option').all();
    if (options.length > index) {
      await this.policySelect.selectOption({ index });
    }
  }

  /**
   * Select policy by policy number text
   */
  async selectPolicyByText(policyNumber: string): Promise<void> {
    await this.policySelect.selectOption({ label: policyNumber });
  }

  /**
   * Fill payment form
   */
  async fillPaymentForm(data: {
    policyIndex?: number;
    amount: string;
    method: 'NEFT' | 'NACH' | 'CARD' | 'UPI' | 'CHEQUE';
    remarks?: string;
  }): Promise<void> {
    if (data.policyIndex !== undefined) {
      await this.selectPolicyByIndex(data.policyIndex);
    }
    await this.amountInput.fill(data.amount);
    await this.paymentMethod.selectOption(data.method);
    if (data.remarks) {
      await this.remarksInput.fill(data.remarks);
    }
  }

  /**
   * Submit payment form — opens confirmation modal
   */
  async submitPaymentForm(): Promise<void> {
    await this.payButton.click();
    await this.confirmModal.waitFor({ state: 'visible' });
  }

  /**
   * Confirm payment in modal
   */
  async confirmPayment(): Promise<void> {
    await this.confirmButton.click();
    await this.resultCard.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Full payment flow: fill → submit → confirm
   */
  async makePayment(data: {
    policyIndex: number;
    amount: string;
    method: 'NEFT' | 'NACH' | 'CARD' | 'UPI' | 'CHEQUE';
    remarks?: string;
  }): Promise<void> {
    await this.fillPaymentForm(data);
    await this.submitPaymentForm();
    await this.confirmPayment();
  }

  /**
   * Get payment result status
   */
  async getPaymentResultStatus(): Promise<'success' | 'failed'> {
    const content = await this.paymentResult.innerText();
    return content.includes('Payment Successful') ? 'success' : 'failed';
  }

  /**
   * Get transaction reference from result
   */
  async getTransactionRef(): Promise<string> {
    const content = await this.paymentResult.innerText();
    const match = content.match(/TXN-[\w-]+/);
    return match ? match[0] : '';
  }

  /**
   * Get failed payments count
   */
  async getFailedPaymentsCount(): Promise<number> {
    const content = await this.failedPayments.innerText();
    if (content.includes('No failed payments')) return 0;
    return await this.failedPayments.locator('div[style*="border-bottom"]').count();
  }

  /**
   * Retry a failed payment
   */
  async retryFirstFailedPayment(): Promise<void> {
    const retryBtn = this.failedPayments.locator('button:has-text("Retry")').first();
    await retryBtn.click();
  }

  // ── Assertions ──────────────────────────────────────────

  async assertPageLoaded(): Promise<void> {
    await expect(this.page.locator('.page-title')).toContainText('Premium Payment');
    await expect(this.policySelect).toBeVisible();
    await expect(this.payButton).toBeVisible();
  }

  async assertConfirmModalVisible(): Promise<void> {
    await expect(this.confirmModal).toHaveClass(/active/);
  }

  async assertPaymentSuccessful(): Promise<void> {
    await expect(this.paymentResult.locator('.alert-success')).toBeVisible();
    await expect(this.paymentResult).toContainText('Payment Successful');
  }

  async assertPaymentFailed(): Promise<void> {
    await expect(this.paymentResult.locator('.alert-error')).toBeVisible();
  }

  async assertTransactionRefVisible(): Promise<void> {
    await expect(this.paymentResult).toContainText('TXN-');
  }

  async assertReceiptDownloadLinkVisible(): Promise<void> {
    await expect(this.paymentResult.locator('a:has-text("Download Receipt")')).toBeVisible();
  }
}
