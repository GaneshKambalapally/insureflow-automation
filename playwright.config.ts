import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Determine the base URL based on environment
const baseUrl = process.env.BASE_URL || (process.env.CI ? 'http://localhost:3000' : 'http://localhost:3001');
const apiUrl = process.env.API_URL || (process.env.CI ? 'http://localhost:3000/api' : 'http://localhost:3001/api');

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['allure-playwright'],
  ],

  
  use: {
    baseURL: baseUrl,
    ...devices['Desktop Chrome'],
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api-tests',
      testMatch: '**/api/**/*.spec.ts',
    },
    {
      name: 'db-tests',
      testMatch: '**/db/**/*.spec.ts',
    },
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'login-tests',
      testMatch: '**/auth/login.spec.ts',
      dependencies: ['setup'],
      use: {
        baseURL: baseUrl,
      },
    },
    {
      name: 'auth-tests',
      testMatch: '**/auth/*.spec.ts',
      exclude: ['**/login.spec.ts'],
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
    {
      name: 'dashboard-tests',
      testMatch: '**/dashboard.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
    {
      name: 'payment-tests',
      testMatch: '**/payments/payment.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
    {
      name: 'history-tests',
      testMatch: '**/payments/history.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
    {
      name: 'claims-tests',
      testMatch: '**/claims/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
    {
      name: 'refund-tests',
      testMatch: '**/refunds/**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        storageState: './fixtures/admin.json',
      },
    },
  ],
});