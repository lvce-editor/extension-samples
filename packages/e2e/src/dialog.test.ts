import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('warning dialog shows its content and supports confirming, reopening, and closing', async ({ page }) => {
  await page.goto('/extension-samples/dialog/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await runCommand(page, 'Sample: Show Warning Dialog')
  const dialog = page.locator('#preview-ide').getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.DialogHeading')).toHaveText('Example Warning')
  await expect(dialog.locator('.DialogMessage')).toHaveText('This is a sample warning dialog. No files have been changed.')
  await expect(dialog.locator('.DialogWarningIcon.MaskIconWarning')).toBeVisible()
  await expect(page.locator('#source-ide').getByRole('dialog')).toHaveCount(0)
  await dialog.getByRole('button', { exact: true, name: 'OK' }).click()
  await expect(dialog).toBeHidden()
  await runCommand(page, 'Sample: Show Warning Dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { exact: true, name: 'Close' }).click()
  await expect(dialog).toBeHidden()
})
