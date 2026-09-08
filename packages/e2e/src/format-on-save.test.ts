import { expect, test } from '@playwright/test'

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
    await editor.locator('textarea').focus()
    await page.keyboard.press('Control+Home')
    await page.keyboard.insertText('const message={text:"formatted on save"};')
    await page.keyboard.press('Enter')
    await expect(editor.locator('.EditorRow').first()).toHaveText('const message={text:"formatted on save"};')
    await page.keyboard.press('Control+s')
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
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(JSON.stringify(packageJson))
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  expect(
    await page.evaluate(
      () => JSON.parse(JSON.parse(globalThis.localStorage.getItem('extension-samples:workspace:hover-provider')!)['/package.json']).prettier,
    ),
  ).toEqual({ semi: true, singleQuote: false })
  await source.getByRole('tab', { exact: false, name: 'main.ts' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'main.ts Close' })).toHaveAttribute('aria-selected', 'true')
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.insertText("const message={text:'custom settings'}")
  await page.keyboard.press('Enter')
  await page.keyboard.press('Control+s')
  await expect(source.locator('.EditorRow').first()).toHaveText('const message = { text: "custom settings" };')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '3')
})
