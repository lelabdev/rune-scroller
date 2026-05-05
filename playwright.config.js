import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	timeout: 15000,
	retries: 1,
	use: {
		baseURL: 'http://localhost:3210',
	},
	webServer: {
		command: 'bun e2e/serve.js',
		port: 3210,
		reuseExistingServer: true,
	},
});
