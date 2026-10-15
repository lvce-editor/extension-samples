import { expect, type Page } from '@playwright/test'
import { runSelectedCommand } from './RunSelectedCommand.ts'

export const runCommand = async (page: Page, label: string): Promise<void> => {
  await page.locator('#preview-ide .EditorRow').first().click()
  await expect(page.locator('#preview-ide .Editor textarea')).toBeFocused()
  await runSelectedCommand(page, label)
}
