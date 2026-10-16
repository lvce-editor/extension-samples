import { expect, test } from '@playwright/test'

const firstLineCursor = /^[-\d.]+px(?: 0px)?$/

for (const sample of [
  { action: 'Go to Definition', declaration: 'let new_color = blue', missing: 'No definition found', route: 'definition-provider' },
  { action: 'Go to Type Definition', declaration: 'type new_Color = string', missing: 'No type definition found', route: 'type-definition-provider' },
]) {
  test(`${sample.route} navigates to its declaration and handles unknown symbols`, async ({ page }) => {
    await page.goto(`/extension-samples/${sample.route}/`)
    await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
    const editor = page.locator('#preview-ide .Editor')
    const source = page.locator('#source-ide .Editor')
    const sourceText = await source.locator('.EditorRow').allTextContents()
    const navigate = async (): Promise<void> => {
      const cursor = await editor.locator('.EditorCursor').boundingBox()
      if (!cursor) throw new Error('Preview cursor is missing before navigation')
      await page.mouse.click(cursor.x + 2, cursor.y + cursor.height / 2, { button: 'right' })
      const action = page.getByRole('menuitem', { exact: true, name: sample.action })
      await action.click()
      await expect(action).toBeHidden()
    }
    await editor.locator('textarea').focus()
    await navigate()
    await editor.locator('textarea').focus()
    await expect(editor.locator('.EditorCursor')).toHaveCSS('translate', firstLineCursor)
    // Inserting at the resulting cursor proves the action reached the declaration.
    await page.keyboard.insertText('new_')
    await expect(editor.locator('.EditorRow').first()).toHaveText(sample.declaration)
    await expect(source.locator('.EditorRow')).toHaveText(sourceText)
    await page.keyboard.press('ControlOrMeta+z')
    await page.keyboard.press('ControlOrMeta+End')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Home')
    for (let index = 0; index < 7; index++) await page.keyboard.press('ArrowRight')
    await navigate()
    await expect(page.locator('#preview-ide .EditorMessage')).toContainText(sample.missing)
  })
}
