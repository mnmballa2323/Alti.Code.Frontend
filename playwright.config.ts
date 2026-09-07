import path from "path";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load .env files for local execution
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

/**
 * Sovereign Google Cloud Platform End-to-End Execution Matrix
 *
 * Determines the target infrastructure natively.
 * Executed against Google Cloud Run / Cloud CDN environments.
 */
const getSovereignBaseUrl = () => {
  const cloud = process.env.SOVEREIGN_CLOUD || "local";

  switch (cloud) {
    case "gcp":
      return process.env.E2E_GCP_URL || "https://gcp.alticode.app";
    default:
      return "http://localhost:3000";
  }
};

export default defineConfig({
  testDir: "./e2e",
  timeout: 120 * 1000,
  expect: {
    timeout: 10000, // AI Inference requires longer timeouts
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined, // Parallel execution across clouds
  reporter: [["html"], ["list"]],
  use: {
    baseURL: getSovereignBaseUrl(),
    trace: "retain-on-failure", // Keep forensic traces for failed cloud parity checks
    actionTimeout: 15000,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop-Chrome-Sovereign",
      use: { ...devices["Desktop Chrome"] },
    },
    // We strictly test Chromium for standard CI to reduce costs,
    // but the Sovereign Backend is agnostic.
  ],

  // We only run the local webserver if we aren't targeting a live sovereign cloud
  webServer: process.env.SOVEREIGN_CLOUD
    ? undefined
    : {
        command: "E2E_TEST_MODE=true npm run dev",
        port: 3001,
        reuseExistingServer: !process.env.CI,
      },
});
