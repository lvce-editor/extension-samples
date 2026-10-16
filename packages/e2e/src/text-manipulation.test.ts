import { expect, test, type Page } from '@playwright/test'
import { runCommand } from './RunCommand.ts'
import { runSelectedCommand } from './RunSelectedCommand.ts'

const selectFirstLine = async (page: Page): Promise<void> => {
  await page.keyboard.press('ControlOrMeta+Home')
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Shift+ArrowRight')
  }
}

test('text insertion changes only the preview selection and supports undo', async ({ page }) => {
  await page.goto('/extension-samples/text-manipulation/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  const source = page.locator('#source-ide .Editor')
  await expect(preview.locator('.EditorRow')).toHaveText(['Hello, Lvce!', 'Keep this line unchanged.', ''])

  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await selectFirstLine(page)
  await runSelectedCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow')).toHaveText(['Hello, World!', 'Keep this line unchanged.', ''])
  await expect(source).toContainText("executeCommand('Editor.type', 'Hello, World!')")
  await expect(source).not.toContainText('Keep this line unchanged.')

  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await expect(preview.locator('textarea')).toBeFocused()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(preview.locator('.EditorRow')).toHaveText(['Hello, Lvce!', 'Keep this line unchanged.', ''])
})

test('text insertion survives a sample rebuild and inserts at an empty selection', async ({ page }) => {
  await page.goto('/extension-samples/text-manipulation/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  const source = page.locator('#source-ide .Editor')
  const response = await page.request.get('/extension-samples/samples/text-manipulation/files.json')
  const files = await response.json()

  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await selectFirstLine(page)
  await runSelectedCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello, World!')

  await source.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('Hello, World!', 'Hello again!'))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.getByRole('status')).toHaveText('Preview ready')

  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await selectFirstLine(page)
  await runSelectedCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello again!')

  await page.keyboard.press('ControlOrMeta+z')
  await page.keyboard.press('ArrowRight')
  await runCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello again!')
})

test('selection API collapses a selection without replacing its text', async ({ page }) => {
  await page.goto('/extension-samples/text-manipulation/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await selectFirstLine(page)
  await runSelectedCommand(page, 'Sample: Collapse Selections')
  await expect(preview.locator('.EditorSelection')).toHaveCount(0)
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello, Lvce!')
  await runSelectedCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello, Lvce!Hello, World!')
  await preview.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello, Lvce!')
})

test('workspace tab navigation opens, focuses, and closes only preview tabs', async ({ page }) => {
  await page.goto('/extension-samples/text-manipulation/')
  const row = page.locator('#preview-ide .EditorRow').first()
  await expect(row).toHaveText('Hello, Lvce!', { timeout: 30_000 })
  await runCommand(page, 'Sample: Open Example Tabs')
  await expect(row).toHaveText('Second example tab')
  await runCommand(page, 'Sample: Focus Previous Tab')
  await expect(row).toHaveText('First example tab')
  await runCommand(page, 'Sample: Focus Next Tab')
  await expect(row).toHaveText('Second example tab')
  await runCommand(page, 'Sample: Close Example Tabs')
  await expect(row).toHaveText('Hello, Lvce!')
  await expect(page.locator('#source-ide').getByRole('tab').filter({ hasText: 'first-tab.txt' })).toHaveCount(0)
  await expect(page.locator('#source-ide').getByRole('tab').filter({ hasText: 'second-tab.txt' })).toHaveCount(0)
  await expect(page.locator('#source-ide .Editor')).toContainText('registerCommand')
})
