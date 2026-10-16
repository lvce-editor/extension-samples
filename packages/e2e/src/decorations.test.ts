import { expect, test } from '@playwright/test'

test('marker decorations stay in the preview and follow unsaved edits', async ({ page }) => {
  await page.goto('/extension-samples/editor-decorations/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  await expect(editor.locator('.EditorGutterDecorationAdded')).toHaveCount(1)
  await expect(editor.locator('.EditorGutterDecorationModified')).toHaveCount(1)
  await expect(editor.locator('.EditorGutterDecorationDeleted')).toHaveCount(1)
  await editor.locator('.EditorRow').first().click()
  await expect(editor.locator('.EditorLineDecoration')).toHaveText(' — added')
  await editor.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+Home')
  await page.keyboard.press('Delete')
  await editor.locator('.EditorRow').first().click()
  await expect(editor.locator('.EditorLineDecoration')).toHaveCount(0)
  await expect(editor.locator('.EditorGutterDecorationAdded')).toHaveCount(0)
  await expect(page.locator('#source-ide .EditorGutterDecoration')).toHaveCount(0)
})
