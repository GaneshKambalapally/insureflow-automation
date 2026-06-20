import { test, expect } from "../../fixtures/auth.fixtures";
import testData from "../../fixtures/testData.json";

test.describe("Login Page-Functional Test", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  //postive test cases
  test(
    `Login page loads with all elements `,
    {
      annotation: { type: "feature", description: "Login page" },
      tag: ["@smoke", "@regression"],
    },
    async ({ loginPage }) => {
      await loginPage.assertPageLoaded();
      console.log("Successfully verified elements");
      await loginPage.assertLogoText();
      console.log("Successfully verified logo text");
      await loginPage.assertDemoCredsVisible();
    },
  );
  test("@smoke @auth Admin login redirects to dashboard", async ({
    loginPage,
  }) => {
    await loginPage.loginAsAdmin();
    await loginPage.assertRedirectToDashboard();
  });
  test("@smoke @auth Agent login redirects to dashboard", async ({
    loginPage,
  }) => {
    await loginPage.loginAsAgent();
    await loginPage.assertRedirectToDashboard();
  });
  test("@smoke @auth Policyholder login redirects to dashboard", async ({
    loginPage,
  }) => {
    await loginPage.loginAsPolicyholder();
    await loginPage.assertRedirectToDashboard();
  });
  test("@regression @auth Admin sees correct name after login", async ({
    loginPage,
    dashboardPage,
  }) => {
    // Two page objects used — both auto-injected
    await loginPage.loginAsAdmin();
    await dashboardPage.assertWelcomeMessageContains("Admin User");
  });
  // Negative test pattern:
  test('@regression @auth Login fails with wrong password', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('wrong@email.com');
    await loginPage.passwordInput.fill('WrongPassword123');
    await loginPage.assertErrorMessage('Invalid');
  });

  test('@regression @auth Login fails with wrong email', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill('notanemail');
    await loginPage.passwordInput.fill('Admin@123');
    await loginPage.loginButton.click();
    await loginPage.assertBrowserValidationBlocks();
  });
  test("@regression @auth Login fails for inactive account", async ({
    loginPage,
  }) => {
    await loginPage.login(
      testData.users.inactiveUser.email,
      testData.users.inactiveUser.password,
    );
    await loginPage.assertErrorMessage("inactive");
  });
  test("@regression @auth Invalid email format blocked by browser", async ({
    loginPage,
    page,
  }) => {
    await loginPage.emailInput.fill("notanemail");
    await loginPage.passwordInput.fill("Admin@123");
    await loginPage.loginButton.click();
    const isInvalid = await page.evaluate(() => {
      const el = document.querySelector("#email") as HTMLInputElement;
      return !el.validity.valid;
    });
    expect(isInvalid).toBe(true);
  });
  // nn EDGE CASES nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn
  test("@regression @auth Login button disabled during API call", async ({
    loginPage,
  }) => {
    await loginPage.emailInput.fill("admin@insureflow.com");
    await loginPage.passwordInput.fill("Admin@123");
    await loginPage.loginButton.click();
    // Immediately check — button disabled during loading
    await expect(loginPage.loginButton).toBeDisabled();
  });
  test("@regression @auth Password field type is password (masked)", async ({
    page,
  }) => {
    const inputType = await page.locator("#password").getAttribute("type");
    console.log(inputType);
    expect(inputType).toBe("password");
  });
});
