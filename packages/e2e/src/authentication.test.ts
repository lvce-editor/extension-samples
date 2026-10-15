import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('local authentication cancels, creates, lists, removes, and resets sessions', async ({ page }) => {
  await page.goto('/extension-samples/authentication-provider/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await runCommand(page, 'Sample: Sign In Locally')
  await expect(page.locator('#preview-ide .QuickPick')).toBeVisible()
  await page.keyboard.press('Escape')
  await runCommand(page, 'Sample: List Local Sessions')
  const lines = page.locator('#preview-ide .OutputContent > .Line')
  await expect(lines.last()).toHaveText('Sessions: 0')
  await runCommand(page, 'Sample: Sign In Locally')
  await page.locator('#preview-ide .QuickPick').getByRole('option').filter({ hasText: 'Demo Reader' }).click()
  await expect(lines).toHaveText(['Sessions: 0', 'Signed in: Demo Reader', 'Sessions: 1'])
  await runCommand(page, 'Sample: Sign Out Locally')
  await expect(lines.last()).toHaveText('Sessions: 0')
  await runCommand(page, 'Sample: Sign Out Locally')
  await expect(lines).toHaveCount(5)
  await page.reload()
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await runCommand(page, 'Sample: List Local Sessions')
  await expect(lines).toHaveText(['Sessions: 0'])
})
