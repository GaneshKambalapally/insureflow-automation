import { test, expect } from "../../fixtures/auth.fixtures";
test.describe("Dashboard functional tests",()=>{
test.beforeEach(async({dashboardPage})=>{

    await dashboardPage.goto()
})
test('@smoke @dashboard Dashboard loads with all stat cards',
async ({ dashboardPage }) => {
await dashboardPage.assertDashboardLoaded();
});
test('@smoke @dashboard Sidebar visible with InsureFlow logo',
async ({ dashboardPage }) => {
await dashboardPage.assertSidebarVisible();
});
test('@regression @dashboard Policies count is greater than zero',
async ({ dashboardPage }) => {
await dashboardPage.assertPoliciesCountIsPositive();
});
test('@regression @dashboard Welcome message contains Admin name',
async ({ dashboardPage }) => {
await dashboardPage.assertWelcomeMessageContains('Admin User');
});
test('@regression @dashboard Policies list renders without Loading text',
async ({ page }) => {
await page.goto('/dashboard.html');
await page.waitForFunction(
() => !document.querySelector('#policiesList')
?.textContent?.includes('Loading...'),
{ timeout: 10000 }
);
await expect(page.locator('#policiesList')).toBeVisible();
});
test('@regression @dashboard Sidebar shows all 5 nav items',
async ({ page }) => {
await page.goto('/dashboard.html');
const items = ['Dashboard','Premium Payment','Claims','Payment History','Refunds'];
for (const item of items) {
await expect(page.locator('.sidebar-nav').getByText(item)).toBeVisible();
}
});
test('@regression @dashboard Navigate to Payment page via sidebar',
async ({ page }) => {
await page.goto('/dashboard.html');
await page.locator('.nav-item').filter({ hasText: 'Premium Payment' }).click();
await expect(page).toHaveURL(/payment\.html/);
});
test('@regression @dashboard Recent payments section loads',
async ({ page }) => {
await page.goto('/dashboard.html');
await page.waitForFunction(
() => !document.querySelector('#recentPayments')
?.textContent?.includes('Loading...'),
{ timeout: 10000 }
);
await expect(page.locator('#recentPayments')).toBeVisible();
});
test('@regression @dashboard Logout redirects to login page',
async ({ page }) => {
await page.goto('/dashboard.html');
await page.locator('button:has-text("Logout")').click();
await page.waitForURL('**/', { timeout: 10000 });
await expect(page.locator('#loginBtn')).toBeVisible();
});
})