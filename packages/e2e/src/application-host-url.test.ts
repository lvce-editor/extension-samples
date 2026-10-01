import { expect, test } from '@playwright/test'

test('removes the legacy applicationHost parameter after startup and preserves the rest of the URL', async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/?applicationHost=1&campaign=trello#readme')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')

  const url = new URL(page.url())
  expect(url.searchParams.has('applicationHost')).toBe(false)
  expect(url.searchParams.get('campaign')).toBe('trello')
  expect(url.hash).toBe('#readme')

  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(page.locator('#source-ide .Editor')).toHaveCount(1)

  await page.getByLabel('Extension sample', { exact: true }).selectOption('html-preview')
  await expect(page).toHaveURL(/\/extension-samples\/html-preview\/$/)
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  expect(new URL(page.url()).searchParams.has('applicationHost')).toBe(false)
})
