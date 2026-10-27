import { defineConfig, devices } from "@playwright/test";

// Opt-in reference capture, deliberately outside normal browser-test discovery.
// Run from the repository root; use a separate port from ordinary test runs.
export default defineConfig({
  testDir: ".",
  testMatch: "capture.spec.ts",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 2,
  retries: 0,
  reporter: "list",
  outputDir: "../../../test-results/module-reference",
  use: {
    baseURL: "http://127.0.0.1:9354",
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "phone",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "narrow",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 568 },
      },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 9354",
    cwd: process.cwd(),
    url: "http://127.0.0.1:9354",
    reuseExistingServer: false,
  },
});
