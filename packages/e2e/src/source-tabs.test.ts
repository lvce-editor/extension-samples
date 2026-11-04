import { expect, test } from '@playwright/test'
import { resetSample } from './PlaygroundControls.ts'

test('source editor opens the manifest beside the configured entry and restores both on reset', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const source = page.locator('#source-ide')
  const manifestTab = source.getByRole('tab', { name: 'extension.json Close' })
  const sourceTab = source.getByRole('tab', { name: 'main.ts Close' })
  await expect(manifestTab).toBeVisible()
  await expect(sourceTab).toBeVisible()
  await expect(source.locator('.EditorRows')).toContainText('Hello World')

  await manifestTab.click()
  await expect(source.locator('.EditorRows')).toContainText('"id"')
  await sourceTab.click()
  await expect(source.locator('.EditorRows')).toContainText('Hello World')

  await resetSample(page)
  await expect(source.getByRole('tab', { name: 'extension.json Close' })).toBeVisible()
  await expect(source.getByRole('tab', { name: 'main.ts Close' })).toBeVisible()
  await expect(source.locator('.EditorRows')).toContainText('Hello World')
})
