import { test, expect} from '../../fixtures/auth.fixtures'
import testData from '../../fixtures/testData.json';
import { FakerHelper } from '../../utils/fakerHelper';
test.describe('Premium Payment - Functional Tests', () => {
test.beforeEach(async ({ paymentPage }) => {
await paymentPage.goto();
});
test('@smoke @payment Payment page loads correctly',
async ({ paymentPage }) => {
await paymentPage.assertPageLoaded();
});
test('@smoke @payment Policy dropdown has active policies',
async ({ page }) => {
await page.goto('/payment.html');
await page.waitForFunction(
() => (document.querySelector('#policySelect') as HTMLSelectElement)
?.options.length > 1, { timeout: 10000 }
);
expect(await page.locator('#policySelect option').count()).toBeGreaterThan(1);
});
test('@smoke @payment NEFT payment end-to-end flow',
async ({ paymentPage }) => {
await paymentPage.makePayment({
policyIndex: 1, amount: testData.payments.valid.amount,
method: 'NEFT', remarks: testData.payments.valid.remarks
});
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
await expect(paymentPage.resultCard).toBeVisible();
});
test('@regression @payment NACH payment flow completes',async ({ paymentPage }) => {
await paymentPage.makePayment({
policyIndex: 1, amount: testData.payments.validNACH.amount, method: 'NACH'
});
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
});
test('@regression @payment CARD payment flow completes',
async ({ paymentPage }) => {
await paymentPage.makePayment({
policyIndex: 1, amount: testData.payments.validCARD.amount, method: 'CARD'
});
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
});
test('@regression @payment UPI payment with Faker data',
async ({ paymentPage }) => {
await paymentPage.makePayment({
policyIndex: 1,
amount: FakerHelper.generatePaymentAmount(),
method: 'UPI',
remarks: FakerHelper.generatePaymentRemarks()
});
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
});
test('@regression @payment CHEQUE payment flow completes',
async ({ paymentPage }) => {
await paymentPage.makePayment({
policyIndex: 1, amount: testData.payments.validCHEQUE.amount, method: 'CHEQUE'
});
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
});
test('@regression @payment Selecting policy auto-fills premium amount',
async ({ paymentPage }) => {
await paymentPage.selectPolicyByIndex(1);
const amount = await paymentPage.amountInput.inputValue();
expect(parseFloat(amount)).toBeGreaterThan(0);
});
test('@regression',async ({ paymentPage }) => {
await paymentPage.selectPolicyByIndex(1);
await expect(paymentPage.policyDetails).toBeVisible();
});
test('@regression @payment Confirmation modal appears on submit',
async ({ paymentPage }) => {
await paymentPage.fillPaymentForm({ policyIndex:1, amount:'12500', method:'NEFT' });
await paymentPage.submitPaymentForm();
await paymentPage.assertConfirmModalVisible();
await expect(paymentPage.page.locator('#confirmText')).toContainText('NEFT');
});
test('@regression @payment Cancel modal does not process payment',
async ({ paymentPage }) => {
await paymentPage.fillPaymentForm({ policyIndex:1, amount:'12500', method:'NEFT' });
await paymentPage.submitPaymentForm();
await paymentPage.assertConfirmModalVisible();
await paymentPage.cancelButton.click();
await expect(paymentPage.confirmModal).not.toHaveClass(/active/);
await expect(paymentPage.resultCard).not.toBeVisible();
});
test('@regression @payment Successful payment shows receipt link',
async ({ paymentPage }) => {
await paymentPage.makePayment({ policyIndex:1, amount:'12500', method:'NEFT' });
await paymentPage.resultCard.waitFor({ state: 'visible', timeout: 15000 });
const status = await paymentPage.getPaymentResultStatus();
if (status === 'success') {
await paymentPage.assertReceiptDownloadLinkVisible();
}
});
test('@regression @payment Form blocked without policy selection',
async ({ paymentPage, page }) => {
await paymentPage.amountInput.fill('12500');
await paymentPage.paymentMethod.selectOption('NEFT');
await paymentPage.payButton.click();
const isInvalid = await page.evaluate(() => {
const el = document.querySelector('#policySelect') as HTMLSelectElement;
return !el.validity.valid;
});
expect(isInvalid).toBe(true);
});
test('@regression @payment Form blocked without payment method',
async ({ paymentPage, page }) => {
await paymentPage.selectPolicyByIndex(1);
await paymentPage.amountInput.fill('12500');
await paymentPage.payButton.click();
const isInvalid = await page.evaluate(() => {
const el = document.querySelector('#paymentMethod') as HTMLSelectElement;
return !el.validity.valid;
});
expect(isInvalid).toBe(true);
});
test('@regression @payment Failed payment queue section is visible',
async ({ paymentPage }) => {
await expect(paymentPage.failedPayments).toBeVisible();
});
test('@regression @payment Retry button shown for retryable payments',
async ({ page }) => {
await page.goto('/payment.html');
await page.waitForFunction(
() => !document.querySelector('#failedPayments')
?.textContent?.includes('Loading...'), { timeout:8000 }
);
const content = await page.locator('#failedPayments').innerText();
if (!content.includes('No failed payments')) {
const retryBtn = page.locator('#failedPayments button:has-text("Retry")').first();
await expect(retryBtn).toBeVisible();
}
});
})