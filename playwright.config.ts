//imports
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: ".env.test" });
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

//global config

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: { timeout: 30000 },
  fullyParallel: true,
  retries: 1,
  workers: 2,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["allure-playwright"],
  ],

  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "on-first-failure",
    actionTimeout: 5000,
    viewport: { width: 1280, height: 720 },
  },
  outputDir: "test-results",

  projects: [
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      //use: { ...devices["Desktop Chrome"] },defined globally
    },
    {
      name: "auth-tests",
      testMatch: "**/auth/login.spec.ts",
     // use: { ...devices["Desktop Edge"] },
    },
    {
      name: "dashboard-tests",
      testMatch: "**/auth/dashboard.spec.ts",
      dependencies: ["setup"],
      use: {
        storageState: path.join(__dirname, "fixtures/admin.json"),
      },
    },
    {
      name: "payment-tests",
      testMatch: "**/payments/payment.spec.ts",
      dependencies: ["setup"],
      use: {
        storageState: path.join(__dirname, "fixtures/admin.json"),
      },
    },
    {
      name: "history-tests",
      testMatch: "**/payments/history.spec.ts",
      dependencies: ["setup"],
      use: {storageState: path.join(__dirname, "fixtures/admin.json"),
      },
    },
    {
      name: "claims-tests",
      testMatch: "**/claims/claims.spec.ts",
      dependencies: ["setup"],
      use: {storageState: path.join(__dirname, "fixtures/admin.json"),
      },
    },
    {
      name: "refund-tests",
      testMatch: "**/refunds/refund.spec.ts",
      dependencies: ["setup"],
      use: {storageState: path.join(__dirname, "fixtures/admin.json"),
      },
    },
    {
      name: "api-tests",
      testMatch: "**/api/**/*.spec.ts",
      // **/ = match any subfolder — gets all 3 api spec files at once
      },
    {
      name: "db-tests",
      testMatch: "**/db/**/*.spec.ts",
      },
  ],
});
