import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('hello world notifications stay within their applications and dismiss independently', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide')
  await runCommand(page, 'Sample: Hello World')
  await expect(preview.locator('.NotificationMessage')).toHaveText('Hello World!')
  await expect(page.locator('#source-ide .NotificationMessage')).toHaveCount(0)
  const runtime = await (await page.request.get('/extension-samples/runtime.json')).json()
  await page.evaluate(async (entry) => {
    const renderer = await import(entry)
    await renderer.executeCommand('Application.execute', 'source', 'Notification.create', 'info', 'Source notification')
  }, runtime.entry)
  const source = page.locator('#source-ide')
  await expect(source.locator('.NotificationMessage')).toHaveText('Source notification')
  for (const application of [source, preview]) {
    await expect
      .poll(() =>
        application.evaluate((element) => {
          const parent = element.getBoundingClientRect()
          const popup = element.querySelector('.Notification')!.getBoundingClientRect()
          return popup.left >= parent.left && popup.right <= parent.right && popup.top >= parent.top && popup.bottom <= parent.bottom
        }),
      )
      .toBe(true)
  }
  await preview.locator('.NotificationCloseButton').click()
  await expect(preview.locator('.NotificationMessage')).toHaveCount(0)
  await expect(source.locator('.NotificationMessage')).toHaveText('Source notification')
  await runCommand(page, 'Sample: Hello World')
  await expect(preview.locator('.NotificationMessage')).toHaveText('Hello World!')
  await source.locator('.NotificationCloseButton').click()
  await expect(source.locator('.NotificationMessage')).toHaveCount(0)
  await expect(preview.locator('.NotificationMessage')).toHaveText('Hello World!')
})
