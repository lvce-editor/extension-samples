import { expect, test, type Page } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('extension color picker opens with an initial color and edits the current document', async ({ page }) => {
  await page.goto('/extension-samples/color-picker/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await runCommand(page, 'Sample: Open Color Picker')
  const picker = page.locator('#preview-ide .ColorPicker')
  await expect(picker).toBeVisible()
  await expect(picker.locator('.ColorPickerBackgroundColor')).toHaveCSS('background-color', 'rgb(255, 136, 0)')
  const slider = picker.locator('.ColorPickerSliderWrapper')
  await expect(slider).toBeVisible()
  await slider.click({ position: { x: 200, y: 15 } })
  await expect(page.locator('#preview-ide .Editor')).not.toContainText('#112233')
  await expect(page.locator('#preview-ide .Editor')).toContainText('#')
  await page.keyboard.press('Escape')
  await expect(picker).toBeHidden()
})

const execute = async (page: Page, applicationId: string, command: string, ...args: readonly unknown[]): Promise<any> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  return page.evaluate(
    async ({ applicationId, args, command, entry }) => {
      const renderer = await import(entry)
      return renderer.executeCommand('Application.execute', applicationId, command, ...args)
    },
    { applicationId, args, command, entry },
  )
}

test('explicit picker target edits only that editor after focus moves to another editor and application', async ({ page }) => {
  await page.goto('/extension-samples/color-picker/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const target = await execute(page, 'preview', 'GetActiveEditor.getActiveEditorInfo')
  expect(target).toEqual({ id: expect.any(Number), uri: expect.any(String) })
  const sourceText = await page.locator('#source-ide .Editor').innerText()
  await execute(page, 'preview', 'FileSystem.writeFile', 'memfs:///other.css', '.other { color: #445566; }')
  await execute(page, 'preview', 'Main.splitRight')
  await execute(page, 'preview', 'Main.openUri', 'memfs:///other.css')
  await expect(page.locator('#preview-ide .Editor')).toHaveCount(2)
  const other = await execute(page, 'preview', 'GetActiveEditor.getActiveEditorInfo')
  expect(other.id).not.toBe(target.id)
  expect(other.uri).toBe('memfs:///other.css')
  await page.locator('#source-ide .Editor textarea').focus()
  const previewSnapshot = await execute(page, 'preview', 'GetActiveEditor.getActiveEditorInfo')
  expect(previewSnapshot).toEqual(other)
  await execute(page, 'preview', 'GetActiveEditor.openColorPicker', target.id, '#ff8800')
  const targetEditor = page.locator(`#preview-ide .Editor[data-uid="${target.id}"]`)
  const otherEditor = page.locator(`#preview-ide .Editor[data-uid="${other.id}"]`)
  const picker = targetEditor.locator('.ColorPicker')
  await expect(picker).toBeVisible()
  await expect(otherEditor.locator('.ColorPicker')).toHaveCount(0)
  await picker.locator('.ColorPickerSliderWrapper').click({ position: { x: 200, y: 15 } })
  await expect(targetEditor).not.toContainText('#112233')
  await expect(otherEditor).toContainText('#445566')
  await expect.poll(() => page.locator('#source-ide .Editor').innerText()).toBe(sourceText)
})

test('missing, foreign and closed editor targets reject and an empty preview has no active editor', async ({ page }) => {
  await page.goto('/extension-samples/color-picker/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const target = await execute(page, 'preview', 'GetActiveEditor.getActiveEditorInfo')
  const source = await execute(page, 'source', 'GetActiveEditor.getActiveEditorInfo')
  for (const id of [undefined, -1, source.id]) {
    await expect(execute(page, 'preview', 'GetActiveEditor.openColorPicker', id)).rejects.toThrow()
  }
  await expect(page.locator('.ColorPicker')).toHaveCount(0)
  await execute(page, 'preview', 'Main.closeAllEditors')
  expect(await execute(page, 'preview', 'GetActiveEditor.getActiveEditorInfo')).toBeUndefined()
  await expect(execute(page, 'preview', 'GetActiveEditor.openColorPicker', target.id)).rejects.toThrow()
  await execute(page, 'preview', 'ExtensionHost.executeCommand', 'sample.openColorPicker')
  await expect(page.locator('.ColorPicker')).toHaveCount(0)
})
