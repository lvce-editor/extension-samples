import { expect, type Page } from '@playwright/test'

export const runSelectedCommand = async (page: Page, label: string): Promise<void> => {
  await page.keyboard.press('F1')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const command = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(command).toBeVisible()
  await command.click()
}
