import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('hello world shows a notification and can run again after dismissal', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide')
  await runCommand(page, 'Sample: Hello World')
  await expect(preview.locator('.NotificationMessage')).toHaveText('Hello World!')
  await expect(page.locator('#source-ide .NotificationMessage')).toHaveCount(0)
  await preview.locator('.NotificationCloseButton').click()
  await expect(preview.locator('.NotificationMessage')).toHaveCount(0)
  await runCommand(page, 'Sample: Hello World')
  await expect(preview.locator('.NotificationMessage')).toHaveText('Hello World!')
})
