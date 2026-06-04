import { Page, Locator, expect } from "@playwright/test";
import path from "node:path";
export class BasePage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  //navigate
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async waitForElement(locator: Locator, timeout: 3000): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }
  async getToastMessages(): Promise<string> {
    const toast = this.page.locator(".toast").first();
    await toast.waitFor({ state: "visible", timeout: 3000 });
    return await toast.innerText();
  }
  async waitForSuccessToast(): Promise<void> {
    await this.page
      .locator(".toast-success")
      .waitFor({ state: "visible", timeout: 5000 });
  }

  async waitForErrorToast(): Promise<void> {
    await this.page
      .locator(".toast-error")
      .waitFor({ state: "visible", timeout: 5000 });
  }

  async getAlertMessage(): Promise<string> {
    const alert = this.page.locator(".alert").first();
    await alert.waitFor({ state: "visible", timeout: 5000 });
    return await alert.innerText();
  }
  //model
  async isModalVisible(): Promise<boolean> {
    return await this.page.locator(".modal-overlay.active").isVisible();
  }

  async closeModal(): Promise<void> {
    await this.page
      .locator(".btn-outline")
      .filter({ hasText: "Cancel" })
      .click();
    await this.page.locator(".modal-overlay").waitFor({ state: "hidden" });
  }
  async getTableRowCount(selector = "tbody tr"): Promise<number> {
    await this.page.waitForSelector(selector, { timeout: 8000 });
    return await this.page.locator(selector).count();
  }

  async tableContainsText(text: string): Promise<boolean> {
    const content = await this.page.locator("tbody").innerText();
    return content.includes(text);
  }

  // ── FORM ─────────────────────────────────────────────
  async fillByLabel(label: string, value: string): Promise<void> {
    await this.page.getByLabel(label).fill(value);
  }

  // ── PAGE ─────────────────────────────────────────────
  async getPageTitle(): Promise<string> {
    return await this.page.locator(".page-title").innerText();
  }
  async isSidebarVisible(): Promise<boolean> {
    return await this.page.locator(".sidebar").isVisible();
  }

  async getLoggedInRole(): Promise<string> {
    return await this.page.locator(".user-role").innerText();
  }
}
