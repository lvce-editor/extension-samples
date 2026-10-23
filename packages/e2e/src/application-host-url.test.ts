import { expect, test } from '@playwright/test'

const htmlPreviewUrl = /\/extension-samples\/html-preview\/$/
const completionPreviewUrl = /\/extension-samples\/completion-provider\/$/
const completionProviderOption = /Completion Provider/
const htmlPreviewOption = /HTML Preview/

test('selects a sample with the status bar QuickPick and preserves the current URL on cancellation', async ({ page }) => {
  await page.goto('/extension-samples/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  await page.goto('/extension-samples/source-control-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const originalUrl = page.url()
  await page.getByRole('button', { name: 'Choose a sample' }).click()
  const quickPick = page.getByRole('option')
  await expect(quickPick.filter({ hasText: completionProviderOption })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(originalUrl)

  await page.getByRole('button', { name: 'Choose a sample' }).click()
  await page.getByRole('option', { name: completionProviderOption }).click()
  await expect(page).toHaveURL(completionPreviewUrl)
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
})

test('keeps both native status bars visible without the custom toolbar and pane headers', async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  await expect(page.locator('.Toolbar, .IdePane > header')).toHaveCount(0)
  await expect(page.locator('#source-ide .StatusBar')).toBeVisible()
  await expect(page.locator('#preview-ide .StatusBar')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose a sample' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset sample' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preview ready' })).toBeVisible()

  await page.setViewportSize({ height: 800, width: 1100 })
  await expect(page.locator('#source-ide .StatusBar')).toBeVisible()
  await expect(page.locator('#preview-ide .StatusBar')).toBeVisible()
})

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

  await page.getByRole('button', { name: 'Choose a sample' }).click()
  await page.getByRole('combobox', { name: 'Choose an extension sample' }).fill('HTML Preview')
  await page.getByRole('option', { name: htmlPreviewOption }).click()
  await expect(page).toHaveURL(htmlPreviewUrl)
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  expect(new URL(page.url()).searchParams.has('applicationHost')).toBe(false)
})
