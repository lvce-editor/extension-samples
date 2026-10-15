import { expect, test } from '@playwright/test'

const firstLineCursor = /^[-\d.]+px(?: 0px)?$/

for (const sample of [
  { action: 'Go To Definition', declaration: 'let new_color = blue', missing: 'No definition found', route: 'definition-provider' },
  { action: 'Go To Type Definition', declaration: 'type new_Color = string', missing: 'No type definition found', route: 'type-definition-provider' },
]) {
  test(`${sample.route} navigates to its declaration and handles unknown symbols`, async ({ page }) => {
    await page.goto(`/extension-samples/${sample.route}/`)
    await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
    const editor = page.locator('#preview-ide .Editor')
    const source = page.locator('#source-ide .Editor')
    const sourceText = await source.locator('.EditorRow').allTextContents()
    const navigate = async (): Promise<void> => {
      await page.keyboard.press('F1')
      const picker = page.locator('#preview-ide .QuickPick')
      await picker.locator('input').fill(`>Editor: ${sample.action}`)
      await picker.getByRole('option', { exact: true, name: `Editor: ${sample.action}` }).click()
      await expect(picker).toBeHidden()
    }
    await editor.locator('textarea').focus()
    await navigate()
    await expect(editor.locator('.EditorCursor')).toHaveCSS('translate', firstLineCursor)
    await editor.locator('textarea').focus()
    // Inserting at the resulting cursor proves the action reached the declaration.
    await page.keyboard.insertText('new_')
    await expect(editor.locator('.EditorRow').first()).toHaveText(sample.declaration)
    await expect(source.locator('.EditorRow')).toHaveText(sourceText)
    await page.keyboard.press('Control+z')
    await page.keyboard.press('Control+End')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Home')
    for (let index = 0; index < 7; index++) await page.keyboard.press('ArrowRight')
    await navigate()
    await expect(page.locator('#preview-ide .EditorMessage')).toContainText(sample.missing)
  })
}
