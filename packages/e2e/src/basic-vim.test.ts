// cspell:words keymap lpha zzzalpha hzzzalpha himport iworks worksalpha cawword dawqqq dawdaw ldaw
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

test('starts Basic Vim in legacy application host mode', async ({ page }) => {
  const workspaceErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('No Workspace instance')) workspaceErrors.push(message.text())
  })
  await page.goto('/extension-samples/basic-vim/?applicationHost=1')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(page.locator('#source-ide .Editor')).toHaveCount(1)
  await expect(page.locator('#preview-ide .Editor')).toHaveCount(1)
  expect(workspaceErrors).toEqual([])
})

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
  const lastRowOffset = await page
    .locator('#preview-ide .EditorRow')
    .evaluateAll((rows) => (rows.at(-1) as HTMLElement).offsetTop - (rows[0] as HTMLElement).offsetTop)
  const end = `${origin.split(' ', 1)[0]} ${lastRowOffset}px`
  await expect.poll(() => translation(page)).toBe(end)
  await page.keyboard.press('j')
  await page.keyboard.press('l')
  await page.evaluate(async () => {
    const prefix = globalThis.document.body.dataset.routePrefix
    const response = await globalThis.fetch(`${prefix}/runtime.json`)
    const { entry } = await response.json()
    const renderer = await import(entry)
    // Wait for preceding native shortcuts, including no-op boundary commands.
    await renderer.executeShortcut('Application.execute', 'preview', 'GetActiveEditor.getSelections')
  })
  await expect.poll(() => translation(page)).toBe(end)
  await expectOriginalText(page)
})

test('legacy application host URL starts Basic Vim and refreshes the preview after saving', async ({ page }) => {
  await page.goto('/extension-samples/basic-vim/?applicationHost=1')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await expect(page.locator('#source-ide .Editor')).toBeVisible()
  await expect(page.locator('#preview-ide .Editor')).toBeVisible()
  const response = await page.request.get('/extension-samples/samples/basic-vim/files.json')
  const files = await response.json()
  await page.locator('#source-ide').getByRole('treeitem', { exact: true, name: 'extension.json' }).click()
  await expect(page.locator('#source-ide').getByRole('tab', { exact: true, name: 'extension.json Close' })).toBeVisible()
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/extension.json'].replace('"cursorStyle": "block"', '"cursorStyle": "line"'))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(page.locator('#preview-ide .EditorCursor')).toHaveCSS('width', '2px')
})

test('root legacy application host URL starts the selected sample', async ({ page }) => {
  await page.goto('/extension-samples/?applicationHost=1')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#source-ide .Editor')).toBeVisible()
  await expect(page.locator('#preview-ide .Editor')).toBeVisible()
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
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

test('daw deletes the word under the cursor and caw enters insert mode with undo support', async ({ page }) => {
  await open(page)
  const rows = page.locator('#preview-ide .EditorRow')
  await page.keyboard.press('l')
  await page.keyboard.press('l')
  await page.keyboard.press('l')
  await page.keyboard.type('daw')
  await expect(rows.first()).toHaveText(' beta')
  await page.keyboard.press('u')
  await expectOriginalText(page)

  await page.keyboard.press('ControlOrMeta+Home')
  await page.keyboard.press('l')
  await page.keyboard.press('l')
  await page.keyboard.press('l')
  await page.keyboard.type('cawword')
  await expect(rows.first()).toHaveText('word beta')
  await page.keyboard.press('Escape')
  await page.keyboard.type('q')
  await expect(rows.first()).toHaveText('word beta')
  await page.keyboard.press('u')
  await expect(rows.first()).toHaveText(' beta')
  await page.keyboard.press('u')
  await expectOriginalText(page)
})

for (const [text, column, expected] of [
  ['alpha beta', 0, ' beta'],
  ['alpha beta', 4, ' beta'],
  ['alpha beta', 6, 'alpha '],
  ['alpha beta', 9, 'alpha '],
  ['alpha beta', 5, 'alpha beta'],
  ['alpha beta', 10, 'alpha beta'],
  ['alpha, beta', 5, 'alpha, beta'],
  ['café42, next', 3, ', next'],
  ['', 0, ''],
] as const) {
  test(`daw at column ${String(column)} in ${JSON.stringify(text)} preserves surrounding text`, async ({ page }) => {
    await open(page)
    await page.keyboard.press('i')
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Backspace')
    if (text) await page.keyboard.insertText(text)
    await page.keyboard.press('Escape')
    await page.keyboard.press('ControlOrMeta+Home')
    for (let index = 0; index < column; index++) await page.keyboard.press('l')
    await page.keyboard.type('dawqqq')
    await expect(page.locator('#preview-ide .EditorRow')).toHaveText([expected])
  })
}

test('incomplete and invalid operator sequences recover without editing text', async ({ page }) => {
  await open(page)
  for (const prefix of ['d', 'da', 'c', 'ca']) {
    await page.keyboard.type(prefix)
    await page.keyboard.press('Escape')
    await page.keyboard.type('qqq')
    await expectOriginalText(page)
  }
  for (const sequence of ['dq', 'daq', 'cq', 'caq']) {
    await page.keyboard.type(sequence)
    await page.keyboard.type('qqq')
    await expectOriginalText(page)
  }
  await page.keyboard.type('dawdaw')
  await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText(' beta')
  await page.keyboard.type('ldaw')
  await expect(page.locator('#preview-ide .EditorRow').first()).toHaveText(' ')
})

test('caw on the empty final line accepts immediate replacement text', async ({ page }) => {
  await open(page)
  await page.keyboard.press('ControlOrMeta+End')
  await page.keyboard.type('cawword')
  await expect(page.locator('#preview-ide .EditorRow').last()).toHaveText('word')
  await page.keyboard.press('Escape')
  await page.keyboard.type('qqq')
  await expect(page.locator('#preview-ide .EditorRow').last()).toHaveText('word')
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
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('>')
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
  await page.locator('#source-ide').getByRole('treeitem', { exact: true, name: 'extension.json' }).click()
  await expect(page.locator('#source-ide').getByRole('tab', { exact: true, name: 'extension.json Close' })).toBeVisible()
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/extension.json'].replace('"cursorStyle": "block"', '"cursorStyle": "line"'))
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

test('manifest keys invoke the Vim extension command', async ({ page }) => {
  await open(page)
  const response = await page.request.get('/extension-samples/samples/basic-vim/files.json')
  const files = await response.json()
  const manifest: { keyMap: { modes: Record<string, { bindings: Record<string, { command: string }> }> } } = JSON.parse(files['/extension.json'])
  for (const mode of Object.values(manifest.keyMap.modes)) {
    for (const binding of Object.values(mode.bindings))
      expect(['basicVim.handleKey', 'basicVim.consumeKey', 'basicVim.deleteWord']).toContain(binding.command)
  }
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('Editor.cursorCharacterLeft', 'Editor.cursorCharacterRight'))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await focusEditor(page)
  await page.keyboard.press('ControlOrMeta+Home')
  const origin = await translation(page)
  await page.keyboard.press('h')
  await expect.poll(() => translation(page)).not.toBe(origin)
  await expectOriginalText(page)
})
