import { expect, test, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'
import { replaceSourceText } from './ReplaceSourceText.ts'

const sourceSelections = async (page: Page): Promise<unknown> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  return page.evaluate(async (entry) => {
    const renderer = await import(entry)
    return renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getSelections')
  }, entry)
}

for (const restoredDraft of [false, true]) {
  test(`formats saved sample TypeScript with Prettier and persists it (restored draft: ${restoredDraft})`, async ({ page }) => {
    if (restoredDraft) {
      const response = await page.request.get('/extension-samples/samples/hover-provider/files.json')
      const files = await response.json()
      const packageJson = JSON.parse(files['/package.json'])
      delete packageJson.prettier
      files['/package.json'] = JSON.stringify(packageJson)
      await page.addInitScript((files) => {
        const key = 'extension-samples:workspace:hover-provider'
        if (!globalThis.localStorage.getItem(key)) globalThis.localStorage.setItem(key, JSON.stringify(files))
      }, files)
    }
    await page.goto('/extension-samples/hover-provider/')
    await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
    const source = page.locator('#source-ide')
    const editor = source.locator('.Editor')
    await editor.locator('.EditorRow').first().click()
    await focusEditor(page, 'source')
    await page.keyboard.press('ControlOrMeta+Home')
    await expect.poll(() => sourceSelections(page)).toEqual([0, 0, 0, 0])
    await page.keyboard.insertText('const message={text:"formatted on save"};')
    await expect.poll(() => sourceSelections(page)).toEqual([0, 41, 0, 41])
    await page.keyboard.press('Enter')
    await expect(editor.locator('.EditorRow').first()).toHaveText('const message={text:"formatted on save"};')
    await page.keyboard.press('ControlOrMeta+s')
    await expect(editor.locator('.EditorRow').first()).toHaveText("const message = { text: 'formatted on save' }")
    await expect
      .poll(() =>
        page.evaluate(() => {
          const files = JSON.parse(globalThis.localStorage.getItem('extension-samples:workspace:hover-provider') || '{}')
          return files['/src/main.ts']?.split('\n', 1)[0]
        }),
      )
      .toBe("const message = { text: 'formatted on save' }")
    await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
    await expect(page.getByRole('status')).toHaveText('Preview ready')
    await page.reload()
    await expect(editor.locator('.EditorRow').first()).toHaveText("const message = { text: 'formatted on save' }", { timeout: 30_000 })
  })
}

test('uses edited package settings for the next save', async ({ page }) => {
  await page.goto('/extension-samples/hover-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: 'package.json' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'package.json Close' })).toHaveAttribute('aria-selected', 'true')
  const response = await page.request.get('/extension-samples/samples/hover-provider/files.json')
  const files = await response.json()
  const packageJson = JSON.parse(files['/package.json'])
  packageJson.prettier = { semi: true, singleQuote: false }
  await replaceSourceText(page, JSON.stringify(packageJson))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  expect(
    await page.evaluate(
      () => JSON.parse(JSON.parse(globalThis.localStorage.getItem('extension-samples:workspace:hover-provider')!)['/package.json']).prettier,
    ),
  ).toEqual({ semi: true, singleQuote: false })
  await source.getByRole('tab', { exact: false, name: 'main.ts' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'main.ts Close' })).toHaveAttribute('aria-selected', 'true')
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+Home')
  await expect.poll(() => sourceSelections(page)).toEqual([0, 0, 0, 0])
  await page.keyboard.insertText("const message={text:'custom settings'}")
  await page.keyboard.press('Enter')
  await page.keyboard.press('ControlOrMeta+s')
  await expect(source.locator('.EditorRow').first()).toHaveText('const message = { text: "custom settings" };')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '3')
})
