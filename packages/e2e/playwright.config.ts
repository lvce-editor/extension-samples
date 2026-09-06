import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './src',
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${process.env.PORT || '3000'}`,
    headless: true,
    trace: 'retain-on-failure',
    viewport: { width: 1600, height: 900 },
  },
  workers: process.env.CI ? 2 : undefined,
  webServer: {
    command: 'npm run dev --prefix ../..',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `http://127.0.0.1:${process.env.PORT || '3000'}/extension-samples/file-system-provider/`,
  },
})
