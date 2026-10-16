import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'

const command = async (page: Page, label: string): Promise<void> => {
  await focusEditor(page)
  await page.keyboard.press('F1')
  const input = page.locator('#preview-ide .QuickPick input')
  await expect(input).toBeVisible()
  await input.fill(`>${label}`)
  const option = page.locator('#preview-ide .QuickPick').getByRole('option', { exact: true, name: label })
  await expect(option).toBeVisible()
  await option.click()
  await expect(page.locator('#preview-ide .QuickPick')).toBeHidden()
}

const focusPreview = async (page: Page): Promise<void> => {
  const editor = page.locator('#preview-ide .Editor')
  await editor.locator('.EditorRow').first().click()
  await focusEditor(page)
  await page.keyboard.press('ControlOrMeta+Home')
}

const selectColumns = async (page: Page, start: number, end: number): Promise<void> => {
  await focusPreview(page)
  for (let index = 0; index < start; index++) await page.keyboard.press('ArrowRight')
  for (let index = start; index < end; index++) await page.keyboard.press('Shift+ArrowRight')
}

test('shows live TODO, keyword, and repeated-word decorations in the preview', async ({ page }) => {
  await page.goto('/extension-samples/text-decoration/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  const decorations = preview.locator('.EditorTextDecoration')

  await command(page, 'Sample: Highlight TODO Markers')
  await expect(decorations).toHaveCount(1)
  await expect(decorations.first()).toHaveCSS('background-color', 'rgb(224, 90, 51)')
  await expect(page.locator('#source-ide .EditorTextDecoration')).toHaveCount(0)

  await command(page, 'Sample: Color Code Keywords')
  await expect(decorations).toHaveCount(2)
  const declaration = decorations.nth(0)
  const flowKeyword = decorations.nth(1)
  await expect(declaration).toHaveCSS('background-color', 'rgb(139, 92, 246)')
  await expect(flowKeyword).toHaveCSS('background-color', 'rgb(22, 139, 120)')

  await command(page, 'Sample: Find Repeated Words')
  await expect(decorations).toHaveCount(1)
  await expect(decorations.first()).toHaveCSS('background-color', 'rgb(212, 155, 22)')
  const textarea = preview.locator('textarea')
  await textarea.focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText('Return the finished preview.\n')
  await expect(decorations).toHaveCount(0)
})

test('underlines empty, repeated, overlapping and multiline selections without editing text', async ({ page }) => {
  await page.goto('/extension-samples/text-decoration/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  const underlines = preview.locator('.EditorTextDecoration')
  const original = ['TODO: choose a bright color', 'const plan = "small samples"', 'return the the finished preview.', '']
  await expect(preview.locator('.EditorRow')).toHaveText(original)
  await focusPreview(page)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(0)

  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)
  await expect(underlines.first()).toHaveCSS('background-color', 'rgb(255, 0, 0)')
  await expect(underlines.first()).toHaveCSS('height', '2px')
  expect(await underlines.first().evaluate((element) => element.getBoundingClientRect().width)).toBeGreaterThan(0)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)

  await selectColumns(page, 3, 9)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(2)
  await command(page, 'Sample: Clear Underlines')
  await expect(underlines).toHaveCount(0)

  await focusPreview(page)
  await page.keyboard.press('Shift+ArrowDown')
  for (let index = 0; index < 6; index++) await page.keyboard.press('Shift+ArrowRight')
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(2)
  await expect(preview.locator('.EditorRow')).toHaveText(original)
  await expect(page.locator('#source-ide .EditorTextDecoration')).toHaveCount(0)
  await expect(preview.locator('.Diagnostic')).toHaveCount(0)

  await preview.locator('textarea').focus()
  await page.keyboard.insertText('Edited')
  await expect(underlines).toHaveCount(0)
  await expect(preview.locator('.EditorRow').first()).toContainText('Edited')
})

test('disposal clears output and rebuilding resets registrations and stale underlines', async ({ page }) => {
  await page.goto('/extension-samples/text-decoration/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  const underlines = preview.locator('.EditorTextDecoration')
  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)
  await command(page, 'Sample: Dispose Underlines')
  await expect(underlines).toHaveCount(0)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(0)

  const response = await page.request.get('/extension-samples/samples/text-decoration/files.json')
  const files = await response.json()
  const rebuild = async (color: string, revision: string): Promise<void> => {
    await focusEditor(page, 'source')
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText(files['/src/main.ts'].replace('#ff0000', () => color))
    await page.keyboard.press('ControlOrMeta+s')
    await expect(page.locator('body')).toHaveAttribute('data-preview-revision', revision)
    await expect(page.getByRole('status')).toHaveText('Preview ready')
  }
  await rebuild('#0000ff', '2')
  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)
  await expect(underlines).toHaveCSS('background-color', 'rgb(0, 0, 255)')
  await rebuild('#00ff00', '3')
  await expect(underlines).toHaveCount(0)
  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)
  await expect(underlines).toHaveCSS('background-color', 'rgb(0, 255, 0)')
})

test('keeps underlines after appending and follows text when lines are inserted or deleted above', async ({ page }) => {
  await page.goto('/extension-samples/text-decoration/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  const textarea = editor.locator('textarea')
  const underlines = editor.locator('.EditorTextDecoration')
  const initialRowCount = await editor.locator('.EditorRow').count()
  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(underlines).toHaveCount(1)
  const originalUnderlineTop = await underlines.first().evaluate((element) => element.getBoundingClientRect().top)
  const firstRowTop = await editor
    .locator('.EditorRow')
    .first()
    .evaluate((element) => element.getBoundingClientRect().top)
  const underlineOffset = originalUnderlineTop - firstRowTop

  await textarea.focus()
  await page.keyboard.press('Control+End')
  await page.keyboard.press('Enter')
  await expect(editor.locator('.EditorRow')).toHaveCount(initialRowCount + 1)
  await expect(underlines).toHaveCount(1)

  await page.keyboard.press('Control+Home')
  await page.keyboard.press('Enter')
  await expect(editor.locator('.EditorRow')).toHaveCount(initialRowCount + 2)
  await expect(underlines).toHaveCount(1)
  const expectUnderlineOnRow = async (rowIndex: number): Promise<void> => {
    await expect
      .poll(async () => {
        const underlineTop = await underlines.first().evaluate((element) => element.getBoundingClientRect().top)
        const rowTop = await editor
          .locator('.EditorRow')
          .nth(rowIndex)
          .evaluate((element) => element.getBoundingClientRect().top)
        return Math.abs(underlineTop - rowTop - underlineOffset)
      })
      .toBeLessThan(2)
  }
  await expectUnderlineOnRow(1)

  await page.keyboard.press('Control+Home')
  await page.keyboard.press('Delete')
  await expect(editor.locator('.EditorRow')).toHaveCount(initialRowCount + 1)
  await expect(underlines).toHaveCount(1)
  await expectUnderlineOnRow(0)
  await page.keyboard.press('Control+z')
  await expect(editor.locator('.EditorRow')).toHaveCount(initialRowCount + 2)
  await expect(underlines).toHaveCount(1)
  await expectUnderlineOnRow(1)
  await page.keyboard.press('Control+Shift+z')
  await expect(editor.locator('.EditorRow')).toHaveCount(initialRowCount + 1)
  await expect(underlines).toHaveCount(1)
  await expectUnderlineOnRow(0)
})

test('custom underlines coexist with links, diagnostics, line and gutter decorations', async ({ page }) => {
  const response = await page.request.get('/extension-samples/samples/text-decoration/files.json')
  const files = await response.json()
  files['/src/main.ts'] = files['/src/main.ts']
    .replace(
      '  activate,',
      '  activate,\n  registerDiagnosticProvider,\n  registerEditorLineDecorationProvider,\n  registerEditorGutterDecorationProvider,',
    )
    .replace(
      '  await activate()',
      `  await activate()
  registerDiagnosticProvider({
    id: 'coexist.diagnostic', languageId: 'plaintext',
    provideDiagnostics: () => [{ columnIndex: 0, endColumnIndex: 6, endRowIndex: 0, rowIndex: 0, type: 'error', message: 'Existing diagnostic', source: 'coexist' }],
  })
  registerEditorLineDecorationProvider({ id: 'coexist.line', provideEditorLineDecoration: (_document, row) => row === 0 ? { text: 'Existing line decoration' } : undefined })
  registerEditorGutterDecorationProvider({ id: 'coexist.gutter', provideEditorGutterDecorations: () => [{ rowIndex: 0, type: 'modified' }] })`,
    )
  const manifest = JSON.parse(files['/extension.json'])
  manifest.activation.push('onEditorLineDecoration', 'onEditorGutterDecoration')
  manifest.diagnosticProviders = [{ id: 'coexist.diagnostic', languageId: 'plaintext' }]
  files['/extension.json'] = JSON.stringify(manifest)
  await page.addInitScript((workspace) => {
    localStorage.setItem('extension-samples:workspace:text-decoration', JSON.stringify(workspace))
  }, files)
  await page.goto('/extension-samples/text-decoration/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const preview = page.locator('#preview-ide .Editor')
  await preview.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText('https://example.com\nsecond line\n')
  await focusPreview(page)
  await expect(preview.locator('.DiagnosticError')).toHaveCount(1)
  await expect(preview.locator('.EditorGutterDecorationModified')).toHaveCount(1)
  await expect(preview.locator('.EditorLineDecoration')).toHaveText('Existing line decoration')
  await expect(preview.locator('.Link')).toHaveText('https://example.com')
  await selectColumns(page, 0, 6)
  await command(page, 'Sample: Underline Selection')
  await expect(preview.locator('.EditorTextDecoration')).toHaveCount(1)
  await expect(preview.locator('.DiagnosticError')).toHaveCount(1)
  await expect(preview.locator('.Link')).toHaveText('https://example.com')
  await expect(preview.locator('.EditorGutterDecorationModified')).toHaveCount(1)
  await expect(preview.locator('.EditorLineDecoration')).toHaveText('Existing line decoration')
  await command(page, 'Sample: Clear Underlines')
  await expect(preview.locator('.EditorTextDecoration')).toHaveCount(0)
  await expect(preview.locator('.DiagnosticError')).toHaveCount(1)
  await expect(preview.locator('.Link')).toHaveText('https://example.com')
  await expect(preview.locator('.EditorGutterDecorationModified')).toHaveCount(1)
  await expect(preview.locator('.EditorLineDecoration')).toHaveText('Existing line decoration')
})
