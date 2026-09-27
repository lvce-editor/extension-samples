import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('opens a live HTML preview and reports parse errors until the source is corrected', async ({ page }) => {
  await page.goto('/extension-samples/html-preview/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await runCommand(page, 'Sample: Open HTML Preview')
  const preview = page.locator('#preview-ide')
  await expect(preview.locator('.SideBar')).toContainText('HTML Preview')
  await expect(preview.locator('.SideBar')).toContainText('Hello, HTML')

  await preview.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText('<main><h1>Updated</h1><p>Live edit</p></main><div')
  await expect(preview.locator('.HtmlPreviewError')).toContainText('Invalid or unsupported HTML')
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText('<main><h1>Updated</h1><p>Live edit</p></main>')
  await expect(preview.locator('.HtmlPreviewError')).toHaveCount(0)
  await expect(preview.locator('.SideBar')).toContainText('Updated')
  await expect(preview.locator('.SideBar')).toContainText('Live edit')
})
