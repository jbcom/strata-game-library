import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for integration testing Strata's public API
 *
 * These tests verify that the library works correctly in a browser environment
 * by testing core functions, React components, and rendering capabilities.
 *
 * Uses Playwright's built-in webServer to spin up a static file server.
 */
export default defineConfig({
	testDir: './tests/integration-playwright',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	timeout: 30000,
	outputDir: 'playwright-results',

	// Reporters for CI integration
	reporter: process.env.CI
		? [
				['list'],
				['junit', { outputFile: 'test-results/junit.xml' }],
			]
		: [['html', { outputFolder: 'test-results/html' }]],

	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'on',
		video: 'retain-on-failure',
	},

	expect: {
		timeout: 5000,
	},

	// Test on multiple browsers
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
	],

	// Use serve package to spin up static file server from project root
	// This gives access to /dist/, /tests/integration-playwright/fixtures/, etc.
	webServer: {
		command: 'pnpm exec serve -C',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
