import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

const nonEmptyLine = /\S/

test('local authentication cancels, creates, lists, removes, and resets sessions', async ({ page }) => {
  await page.goto('/extension-samples/authentication-provider/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await runCommand(page, 'Sample: Sign In Locally')
  await expect(page.locator('#preview-ide .QuickPick')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#preview-ide .QuickPick')).toBeHidden()
  await runCommand(page, 'Sample: List Local Sessions')
  const lines = page.locator('#preview-ide .OutputContent > .Line').filter({ hasText: nonEmptyLine })
  await expect(lines.last()).toHaveText('Sessions: 0')
  await runCommand(page, 'Sample: Sign In Locally')
  await page.locator('#preview-ide .QuickPick').getByRole('option').filter({ hasText: 'Demo Reader' }).click()
  await expect(lines).toHaveText(['Sessions: 0', 'Signed in: Demo Reader', 'Sessions: 1'])
  await runCommand(page, 'Sample: Sign Out Locally')
  await expect(lines.last()).toHaveText('Sessions: 0')
  await runCommand(page, 'Sample: Sign Out Locally')
  await expect(lines).toHaveCount(4)
  await expect(lines.last()).toContainText('Sessions: 0')
  await expect(lines.last().locator('.OutputRepeatCount')).toHaveText('2')
  await page.reload()
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await runCommand(page, 'Sample: List Local Sessions')
  await expect(lines).toHaveText(['Sessions: 0'])
})
