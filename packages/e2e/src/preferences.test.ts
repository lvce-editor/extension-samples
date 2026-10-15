import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('preference sample reads, updates, cancels, and restores an editor setting', async ({ page }) => {
  await page.goto('/extension-samples/preferences/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  const editorRow = editor.locator('.EditorRow').first()
  const originalFontSize = await editorRow.evaluate((element) => getComputedStyle(element).fontSize)
  await runCommand(page, 'Sample: Set Font Size')
  await expect(page.locator('#preview-ide .QuickPick')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#preview-ide .QuickPick')).toBeHidden()
  await expect(editorRow).toHaveCSS('font-size', originalFontSize)
  await runCommand(page, 'Sample: Set Font Size')
  await page.locator('#preview-ide .QuickPick').getByRole('option').filter({ hasText: '18' }).click()
  const output = page.locator('#preview-ide .OutputContent')
  await expect(output).toContainText('Updated editor.fontSize: 18')
  await runCommand(page, 'Sample: Reset Font Size')
  await expect(output).toContainText(`Restored editor.fontSize: ${Number.parseFloat(originalFontSize)}`)
  await expect(editorRow).toHaveCSS('font-size', originalFontSize)
})
