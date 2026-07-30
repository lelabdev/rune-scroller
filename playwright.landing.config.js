import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/landing.test.js"],
  timeout: 15000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3210",
  },
  webServer: {
    // landing page is external; local server still required because the suite
    // imports ANIMATION_TYPES from http://localhost:3210/dist/...
    command: "bun e2e/serve.js",
    port: 3210,
    reuseExistingServer: true,
  },
});
