// cspell:words keymap lpha zzzalpha hzzzalpha himport iworks worksalpha
import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'
import { runCommand } from './RunCommand.ts'

const open = async (page: Page): Promise<void> => {
  await page.goto('/extension-samples/basic-vim/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await focusEditor(page)
  await page.keyboard.press('ControlOrMeta+Home')
}

const translation = async (page: Page): Promise<string> =>
  page.locator('#preview-ide .EditorCursor').evaluate((element) => getComputedStyle(element).translate)

const expectOriginalText = async (page: Page): Promise<void> => {
  await expect(page.locator('#preview-ide .EditorRow')).toHaveText(['alpha beta', 'second line', 'third', ''])
}

test('normal mode has a block cursor and moves without inserting keys, including at boundaries', async ({ page }) => {
  await open(page)
  const cursor = page.locator('#preview-ide .EditorCursor')
  await expect(cursor).toHaveCSS('opacity', '0.5')
  const cursorWidth = await cursor.evaluate((element) => getComputedStyle(element).width)
  expect(Number(cursorWidth.replace('px', ''))).toBeGreaterThan(2)
  const origin = await translation(page)
  await page.keyboard.press('l')
  await expect.poll(() => translation(page)).not.toBe(origin)
  await page.keyboard.press('h')
  await expect.poll(() => translation(page)).toBe(origin)
  await page.keyboard.press('j')
  await expect.poll(() => translation(page)).not.toBe(origin)
  await page.keyboard.press('k')
  await expect.poll(() => translation(page)).toBe(origin)
  await page.keyboard.press('w')
  await expect.poll(() => translation(page)).not.toBe(origin)
  await page.keyboard.press('b')
  await expect.poll(() => translation(page)).toBe(origin)
  await page.keyboard.press('$')
  await expect.poll(() => translation(page)).not.toBe(origin)
  await page.keyboard.press('0')
  await expect.poll(() => translation(page)).toBe(origin)
  await page.keyboard.press('h')
  await page.keyboard.press('k')
  await expect.poll(() => translation(page)).toBe(origin)
  await page.keyboard.type('qQ?')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Delete')
  await page.locator('#preview-ide .Editor textarea').evaluate((element) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', 'ignored paste')
    element.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }))
    for (const type of ['compositionstart', 'compositionupdate', 'compositionend']) {
      element.dispatchEvent(new CompositionEvent(type, { bubbles: true, data: 'ignored composition' }))
    }
  })
  await expectOriginalText(page)
  await page.keyboard.press('ControlOrMeta+End')
  await expect.poll(() => translation(page)).not.toBe(origin)
  const end = await translation(page)
  await page.keyboard.press('j')
  await page.keyboard.press('l')
  await expect.poll(() => translation(page)).toBe(end)
  await expectOriginalText(page)
})

for (const [key, expected] of [
  ['i', '|alpha beta'],
  ['a', 'a|lpha beta'],
  ['A', 'alpha beta|'],
  ['I', '|alpha beta'],
] as const) {
  test(`${key} enters insert mode at the documented position and Escape restores normal mode`, async ({ page }) => {
    await open(page)
    if (key === 'I') await page.keyboard.press('$')
    await page.keyboard.press(key)
    await page.keyboard.insertText('|')
    await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText(expected)
    await page.keyboard.press('Escape')
    await page.keyboard.type('qqq')
    await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText(expected)
  })
}

test('delete and undo work, rapid mode transitions preserve typing, and stop restores ordinary input', async ({ page }) => {
  await open(page)
  const row = page.locator('#preview-ide .EditorRow').first()
  await page.keyboard.press('x')
  await expect(row).toHaveText('lpha beta')
  await page.keyboard.press('u')
  await expectOriginalText(page)
  await page.keyboard.press('0')
  for (let index = 0; index < 3; index++) {
    await page.keyboard.type('iz')
    await page.keyboard.press('Escape')
  }
  await expect(row).toHaveText('zzzalpha beta')
  await runCommand(page, 'Basic Vim: Stop')
  await focusEditor(page)
  await expect(page.locator('#preview-ide .EditorCursor')).toHaveCSS('width', '2px')
  await page.keyboard.press('ControlOrMeta+Home')
  await page.keyboard.type('h')
  await expect(row).toHaveText('hzzzalpha beta')
  await runCommand(page, 'Basic Vim: Start')
  await focusEditor(page)
  await page.keyboard.type('qqq')
  await expect(row).toHaveText('hzzzalpha beta')
  await expect(page.locator('#preview-ide .EditorCursor')).toHaveCSS('opacity', '0.5')
})

test('source and command palette inputs remain editable across focus changes', async ({ page }) => {
  await open(page)
  await focusEditor(page, 'source')
  await expect(page.locator('#source-ide .EditorCursor')).toHaveCSS('width', '2px')
  await page.keyboard.press('ControlOrMeta+Home')
  await page.keyboard.type('h')
  await expect(page.locator('#source-ide .EditorRow').first()).toContainText('himport')
  await focusEditor(page)
  await page.keyboard.press('ControlOrMeta+Shift+p')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill('>')
  await page.keyboard.type('basic')
  await expect(input).toHaveValue('>basic')
  await page.keyboard.press('Escape')
  await focusEditor(page)
  await page.keyboard.type('qqq')
  await expectOriginalText(page)
})

test('rebuilding and resetting releases the old keymap and cursor override', async ({ page }) => {
  await open(page)
  const response = await page.request.get('/extension-samples/samples/basic-vim/files.json')
  const files = await response.json()
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace("cursorStyle: 'block'", "cursorStyle: 'line'"))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await focusEditor(page)
  await expect(page.locator('#preview-ide .EditorCursor')).toHaveCSS('width', '2px')
  await page.keyboard.type('qqq')
  await expectOriginalText(page)
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await focusEditor(page)
  await expect(page.locator('#preview-ide .EditorCursor')).toHaveCSS('opacity', '0.5')
  await page.keyboard.press('ControlOrMeta+Home')
  await page.keyboard.type('iworks')
  await page.keyboard.press('Escape')
  await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText('worksalpha beta')
})
