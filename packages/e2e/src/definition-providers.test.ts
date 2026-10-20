import { expect, test } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'

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
    await focusEditor(page)
    const missingPosition = await editor
      .locator('.EditorRow')
      .filter({ hasText: 'print(missing)' })
      .evaluate((row) => {
        const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
        let offset = 7
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const length = node.textContent?.length || 0
          if (offset <= length) {
            const range = document.createRange()
            range.setStart(node, offset)
            range.collapse(true)
            const bounds = row.getBoundingClientRect()
            return { height: bounds.height, x: range.getBoundingClientRect().x, y: bounds.y }
          }
          offset -= length
        }
        throw new Error('Missing symbol position was not found')
      })
    const navigate = async (position?: { height: number; x: number; y: number }): Promise<void> => {
      const cursor = position ?? (await editor.locator('.EditorCursor').boundingBox())
      if (!cursor) throw new Error('Preview cursor is missing before navigation')
      await page.mouse.click(cursor.x + 2, cursor.y + cursor.height / 2, { button: 'right' })
      const action = page.getByRole('menuitem', { exact: true, name: sample.action })
      await action.click()
      await expect(action).toBeHidden()
    }
    await navigate()
    await focusEditor(page)
    await expect(editor.locator('.EditorCursor')).toHaveCSS('translate', firstLineCursor)
    // Inserting at the resulting cursor proves the action reached the declaration.
    await page.keyboard.insertText('new_')
    await expect(editor.locator('.EditorRow').first()).toHaveText(sample.declaration)
    await expect(source.locator('.EditorRow')).toHaveText(sourceText)
    await page.keyboard.press('ControlOrMeta+z')
    await expect(editor.locator('.EditorRow').first()).toHaveText(sample.declaration.replace('new_', ''))
    await navigate(missingPosition)
    await expect(page.locator('#preview-ide .EditorMessage')).toContainText(sample.missing)
  })
}
