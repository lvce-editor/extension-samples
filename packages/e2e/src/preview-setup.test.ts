import { expect, test } from '@playwright/test'

test('saved setup edits apply on page load without interrupting hot reload', async ({ page }) => {
  await page.goto('/extension-samples/completion-provider/')
  await expect(page.locator('.EditorCompletionItem')).toHaveText(['blue', 'green', 'red'], { timeout: 30_000 })
  await page.keyboard.press('Escape')
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: '.lvce' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'setup-preview.js' }).click()
  const editor = source.locator('.Editor')
  await expect(editor).toContainText('showCompletions')
  await editor.locator('textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(
    "export const setupPreview = async ({ openFile, setCursor, showCompletions }) => {\n  await openFile('example.txt')\n  await setCursor(0, 0)\n  await showCompletions()\n}\n",
  )
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2', { timeout: 30_000 })
  await expect(page.locator('.EditorCompletion')).toBeHidden()
  await expect(editor.locator('textarea')).toBeFocused()
  await page.reload()
  await expect(page.locator('.EditorCompletionItem')).toHaveText(['blue', 'green', 'red'], { timeout: 30_000 })
  await page.keyboard.press('Enter')
  await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText(['blue', 'color='].join(''))
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('.EditorCompletionItem')).toHaveText(['blue', 'green', 'red'], { timeout: 30_000 })
  await page.keyboard.press('Enter')
  await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText('color=blue')
})

test('invalid setup reports an error while keeping the source editable', async ({ page }) => {
  await page.route('**/samples/completion-provider/files.json', async (route) => {
    const response = await route.fetch()
    const files = await response.json()
    files['/.lvce/setup-preview.js'] = 'export const setupPreview = 42'
    await route.fulfill({ json: files })
  })
  await page.goto('/extension-samples/completion-provider/')
  await expect(page.locator('#preview-status')).toContainText('Preview setup failed:', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toContainText('Export a setupPreview function')
  await expect(page.locator('#preview-ide .Editor')).toContainText('color=')
  await expect(page.locator('#source-ide .Editor')).toContainText('registerCompletionProvider')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true')
})
