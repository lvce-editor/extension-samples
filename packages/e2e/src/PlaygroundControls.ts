import type { Page } from '@playwright/test'

export const resetSample = async (page: Page): Promise<void> => {
  const reset = page.locator('#source-ide .StatusBarItem').filter({ hasText: 'Reset' })
  if (await reset.count()) {
    await reset.click()
    return
  }
  await page.getByRole('button', { name: 'Choose a sample' }).click()
  await page.getByRole('combobox', { name: 'Choose an extension sample' }).fill('Reset sample')
  await page.getByRole('option').filter({ hasText: 'Reset sample' }).click()
}

export const selectSample = async (page: Page, title: string): Promise<void> => {
  await page.getByRole('button', { name: 'Choose a sample' }).click()
  await page.getByRole('combobox', { name: 'Choose an extension sample' }).fill(title)
  await page.getByRole('option').filter({ hasText: title }).click()
}
