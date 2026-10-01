import { expect, test } from '@playwright/test'

test('starts independent sample data requests without waiting for the sample index', async ({ page }) => {
  const { promise: indexGate, resolve: releaseIndex } = Promise.withResolvers<void>()
  await page.route('**/samples.json', async (route) => {
    await indexGate
    await route.continue()
  })
  const requests = [
    page.waitForRequest('**/samples/completion-provider/files.json'),
    page.waitForRequest('**/samples/completion-provider/eslint-ignore-hashes.json'),
    page.waitForRequest('**/tooling.json'),
  ]
  try {
    await page.goto('/extension-samples/completion-provider/')
    await Promise.all(requests)
  } finally {
    releaseIndex()
  }
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#source-ide .Editor')).toContainText('registerCompletionProvider')
  await expect(page.locator('#preview-ide .Editor')).toContainText('color=')
})
