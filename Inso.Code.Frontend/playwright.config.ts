import path from "path";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load .env files
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  testDir: "./e2e",
  timeout: 120 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    actionTimeout: 0,
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "E2E_TEST_MODE=true npm run dev",
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
});
