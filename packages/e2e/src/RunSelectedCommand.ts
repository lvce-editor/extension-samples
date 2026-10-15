import { expect, type Page } from '@playwright/test'

export const runSelectedCommand = async (page: Page, label: string): Promise<void> => {
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await page.locator('#preview-ide .Editor textarea').focus()
  await page.keyboard.press('F1')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const command = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(command).toBeVisible()
  await command.click()
  await expect(page.locator('#preview-ide .QuickPick')).toBeHidden()
}
