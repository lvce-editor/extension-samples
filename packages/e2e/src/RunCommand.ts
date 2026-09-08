import { expect, type Page } from '@playwright/test'

export const runCommand = async (page: Page, label: string): Promise<void> => {
  await page.locator('#preview-ide .EditorRow').first().click()
  await expect(page.locator('#preview-ide .Editor textarea')).toBeFocused()
  await page.keyboard.press('F1')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const command = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(command).toBeVisible()
  await command.click()
}
