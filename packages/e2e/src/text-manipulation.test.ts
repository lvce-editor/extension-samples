import { expect, test, type Page } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

const runSelectedCommand = async (page: Page, label: string): Promise<void> => {
  await page.keyboard.press('F1')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const command = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(command).toBeVisible()
  await command.click()
}

const selectFirstLine = async (page: Page): Promise<void> => {
  await page.keyboard.press('Control+Home')
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
  await page.keyboard.press('Control+z')
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
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('Hello, World!', 'Hello again!'))
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.getByRole('status')).toHaveText('Preview ready')

  await preview.locator('.EditorRow').first().click()
  await preview.locator('textarea').focus()
  await selectFirstLine(page)
  await runSelectedCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello again!')

  await page.keyboard.press('Control+z')
  await page.keyboard.press('ArrowRight')
  await runCommand(page, 'Sample: Insert Text')
  await expect(preview.locator('.EditorRow').first()).toHaveText('Hello again!')
})
