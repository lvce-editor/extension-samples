import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'
import { resetSample } from './PlaygroundControls.ts'

const sourceSnapshot = async (page: Page): Promise<unknown> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  return page.evaluate(async (entry) => {
    const renderer = await import(entry)
    const text = await renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getTextDocument')
    const selections = await renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getSelections')
    return { selections, text }
  }, entry)
}

test('typing valid colors updates the view background while invalid input preserves the last valid color', async ({ page }) => {
  await page.goto('/extension-samples/color-view/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide')
  const view = preview.locator('.ColorView')
  const input = view.getByRole('textbox', { name: 'Background color' })
  await expect(input).toHaveAttribute('type', 'text')
  await expect(view).toHaveCSS('background-color', 'rgb(240, 240, 240)')
  await expect(page.locator('#source-ide .ColorView')).toHaveCount(0)

  await input.fill('re')
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('re')
  await expect(view).toHaveCSS('background-color', 'rgb(240, 240, 240)')
  await input.fill('purple')
  await expect(view).toHaveCSS('background-color', 'rgb(128, 0, 128)')
  await input.fill('#0f8')
  await expect(view).toHaveCSS('background-color', 'rgb(0, 255, 136)')
  await input.fill('red; color: blue')
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('red; color: blue')
  await expect(view).toHaveCSS('background-color', 'rgb(0, 255, 136)')
  await input.fill('')
  await expect(view).toHaveCSS('background-color', 'rgb(0, 255, 136)')
})

test('color view input keeps keyboard and pointer interaction out of the source editor', async ({ page }) => {
  await page.goto('/extension-samples/color-view/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide .Editor')
  const colorInput = page.getByRole('textbox', { name: 'Background color' })

  await focusEditor(page, 'source')
  const sourceBefore = await sourceSnapshot(page)
  expect(sourceBefore).toMatchObject({ selections: expect.any(Array), text: { text: expect.stringContaining('registerView') } })

  await colorInput.click()
  await expect(colorInput).toBeFocused()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('tomato')
  await expect(colorInput).toHaveValue('tomato')
  await expect(colorInput).toBeFocused()
  await expect(page.locator('#preview-ide .ColorView')).toHaveCSS('background-color', 'rgb(255, 99, 71)')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('Backspace')
  // cspell:ignore tomao toma
  await expect(colorInput).toHaveValue('tomao')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Backspace')
  await expect(colorInput).toHaveValue('toma')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('Delete')

  await expect(colorInput).toHaveValue('')
  await expect(colorInput).toBeFocused()
  await expect.poll(() => sourceSnapshot(page)).toEqual(sourceBefore)

  await focusEditor(page, 'source')
  await page.keyboard.press('End')
  await page.keyboard.type('// source editing restored')
  await expect(source).toContainText('// source editing restored')
  const editedSource = await sourceSnapshot(page)
  await colorInput.click()
  await page.keyboard.type('#0f8', { delay: 100 })
  await expect(colorInput).toHaveValue('#0f8')
  await expect(colorInput).toBeFocused()
  await expect(page.locator('#preview-ide .ColorView')).toHaveCSS('background-color', 'rgb(0, 255, 136)')
  await expect.poll(() => sourceSnapshot(page)).toEqual(editedSource)

  await page.keyboard.press('F1')
  await expect(page.locator('#preview-ide .QuickPick')).toBeVisible()
  await expect(page.locator('#source-ide .QuickPick')).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(page.locator('.QuickPick')).toBeHidden()
})

test('editing the color view rebuilds the preview and reset restores the sample', async ({ page }) => {
  await page.goto('/extension-samples/color-view/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const input = page.locator('#preview-ide .ColorView').getByRole('textbox', { name: 'Background color' })
  await input.fill('tomato')
  await expect(page.locator('#preview-ide .ColorView')).toHaveCSS('background-color', 'rgb(255, 99, 71)')

  const response = await page.request.get('/extension-samples/samples/color-view/files.json')
  const files = await response.json()
  const source = page.locator('#source-ide')
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace("defaultColor = '#f0f0f0'", "defaultColor = '#eeeeee'"))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.locator('#preview-ide .ColorView')).toHaveCSS('background-color', 'rgb(238, 238, 238)')

  await resetSample(page)
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '1')
  await expect(page.locator('#preview-ide .ColorView')).toHaveCSS('background-color', 'rgb(240, 240, 240)')
})
