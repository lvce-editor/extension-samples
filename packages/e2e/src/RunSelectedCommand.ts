import { expect, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'

export const runSelectedCommand = async (page: Page, label: string): Promise<void> => {
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await focusEditor(page)
  await page.keyboard.press('ControlOrMeta+Shift+p')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const command = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(command).toBeVisible()
  await command.click()
  // The command may immediately open another QuickPick (for example a text input).
  // Wait for the command palette entry to disappear, rather than its reused container.
  await expect(command).toBeHidden()
}
