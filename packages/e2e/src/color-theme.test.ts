import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const helloWorldOption = /Hello World/

const getColorTheme = async (page: Page): Promise<string | undefined> =>
  page.evaluate(() => JSON.parse(globalThis.localStorage.getItem('preferences') || '{}')['workbench.colorTheme'])

test('playground uses the slime theme despite another saved theme preference', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('preferences', JSON.stringify({ 'workbench.colorTheme': 'ayu' }))
    localStorage.setItem(
      'extension-samples:workspace:file-system-provider',
      JSON.stringify({ '/src/main.ts': "export const message = 'Saved draft'\n" }),
    )
  })

  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect.poll(() => getColorTheme(page)).toBe('slime')
  await expect(page.locator('#source-ide .Editor')).toContainText('Saved draft')
  await expect(page.locator('#preview-ide')).toBeVisible()

  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true')
  await expect.poll(() => getColorTheme(page)).toBe('slime')
  await expect(page.locator('#source-ide .Editor')).toContainText('Saved draft')

  await page.getByRole('button', { name: 'Choose a sample' }).click()
  await page.getByRole('combobox', { name: 'Choose an extension sample' }).fill('Hello World')
  await page.getByRole('option', { name: helloWorldOption }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true')
  await expect.poll(() => getColorTheme(page)).toBe('slime')
  await expect(page.locator('#source-ide .Editor')).toBeVisible()
  await expect(page.locator('#preview-ide')).toBeVisible()
})
