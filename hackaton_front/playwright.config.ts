import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // Increase timeout to 60 seconds
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Add 1 retry even in development
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['line']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',  // Always capture traces for better debugging
    screenshot: 'on', // Always capture screenshots
    video: 'on-first-retry',
    // Add timeout for various operations
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },
  projects: [
    // Start with just chromium for faster debugging
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Comment out other browsers until the main tests are working reliably
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000, // Increase server startup timeout to 2 minutes
    reuseExistingServer: !process.env.CI,
    // Add stdout and stderr to see server logs for debugging
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
