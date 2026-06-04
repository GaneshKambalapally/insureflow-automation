import { test as base, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ClaimsPage } from "../pages/ClaimsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HistoryPage } from "../pages/HistoryPage";
import { PaymentPage } from "../pages/PaymentPage";
import { RefundPage } from "../pages/RefundPage";

type InsureFlowPages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  paymentPage: PaymentPage;
  claimsPage: ClaimsPage;
  historyPage: HistoryPage;
  refundPage: RefundPage;
};

export const test = base.extend<InsureFlowPages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page)); //loginpage=use(new LoginPage());
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  claimsPage: async ({ page }, use) => {
    await use(new ClaimsPage(page));
  },
  historyPage: async ({ page }, use) => {
    await use(new HistoryPage(page));
  },
  refundPage: async ({ page }, use) => {
    await use(new RefundPage(page));
  },
});

export { expect } from "@playwright/test";
