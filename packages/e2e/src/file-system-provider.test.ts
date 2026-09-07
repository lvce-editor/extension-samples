import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.locator('#source-ide .Editor')).toHaveCount(1, { timeout: 30_000 })
  await expect(page.locator('#preview-ide .Editor')).toHaveCount(1, { timeout: 30_000 })
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true')
})

test('opens two real LVCE editors with TypeScript highlighting and the file-system preview', async ({ page }, testInfo) => {
  await expect(page).toHaveTitle('File System Provider · Lvce Editor Extension Samples')
  await expect(page.getByLabel('Extension sample', { exact: true })).toHaveValue('file-system-provider')

  const workbench = page
  await expect(workbench.getByRole('tab', { name: 'main.ts' })).toBeVisible()
  await expect(workbench.getByRole('tab', { name: 'README.md' })).toBeVisible()
  await expect(workbench.locator('.Editor').first().locator('.Token.KeywordImport').first()).toHaveText('import')
  const previewEditor = workbench.locator('.Editor').nth(1)
  await expect(previewEditor).toContainText('# Hello from memfs')
  await expect(workbench.locator('iframe')).toHaveCount(0)
  await expect(workbench.locator('.TitleBar:visible, .ActivityBar:visible, .StatusBar:visible')).toHaveCount(0)
  await expect(page.locator('#source-ide .Explorer')).toBeVisible()
  await expect(page.locator('#preview-ide .Explorer')).toBeVisible()
  await expect(page.locator('#source-ide').getByRole('treeitem', { exact: true, name: 'extension.json' })).toBeVisible()
  await expect(page.locator('#preview-ide').getByRole('treeitem', { exact: true, name: 'README.md' })).toBeVisible()
  await testInfo.attach('side-by-side-ides', { body: await page.screenshot(), contentType: 'image/png' })
})

test('runs the built-in ESLint extension in the source editor', async ({ page }) => {
  const workbench = page
  const sourceEditor = workbench.locator('.Editor').first()
  await sourceEditor.locator('textarea').focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.insertText('debugger;')

  await expect(sourceEditor.locator('.EditorRow').first()).toContainText('debugger;')
  await expect(sourceEditor.locator('.LayerDiagnostics .DiagnosticError')).toHaveCount(1, { timeout: 20_000 })
  await expect(page.locator('#preview-ide .DiagnosticError')).toHaveCount(0)
  await page.keyboard.press('Control+z')
  await expect(sourceEditor.locator('.LayerDiagnostics .DiagnosticError')).toHaveCount(0)
})

test('saving TypeScript reloads the provider without replacing the preview editor', async ({ page }) => {
  const workbench = page
  const sourceEditor = workbench.locator('.Editor').first()
  const previewUid = await page.locator('#preview-ide .Editor').getAttribute('data-uid')
  await page.locator('#preview-ide').getByRole('treeitem', { exact: true, name: 'src' }).click()
  await expect(page.locator('#preview-ide').getByRole('treeitem', { exact: true, name: 'example.ts' })).toBeVisible()
  const previewViews = await page.locator('#preview-ide .Viewlet').elementHandles()
  await page.locator('#preview-ide').evaluate((root) => {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (
            node instanceof Element &&
            (node.matches('.TitleBar, .StatusBar, .ActivityBar') || node.querySelector('.TitleBar, .StatusBar, .ActivityBar'))
          ) {
            root.dataset.chromeRemounted = 'true'
          }
        }
      }
    })
    observer.observe(root, { childList: true, subtree: true })
  })
  const response = await page.request.get('/extension-samples/samples/file-system-provider/files.json')
  const files = await response.json()
  await sourceEditor.click()
  await sourceEditor.locator('textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('Hello from memfs', 'Edited live in LVCE:'))
  await page.keyboard.press('Control+s')

  const previewEditor = workbench.locator('.Editor').nth(1)
  await expect(previewEditor).toContainText('Edited live in LVCE:', { timeout: 30_000 })
  await expect(previewEditor).toHaveAttribute('data-uid', previewUid!, { timeout: 1000 })
  for (const view of previewViews) {
    const result = await view.evaluate((element) => ({ className: (element as Element).className, connected: element.isConnected }))
    expect(result.connected, result.className).toBe(true)
  }
  await expect(page.locator('#preview-ide')).not.toHaveAttribute('data-chrome-remounted', 'true')
  await expect(page.locator('#preview-ide').getByRole('treeitem', { exact: true, name: 'example.ts' })).toBeVisible()
})

test('rebuilds an imported file repeatedly without replacing the source IDE or shared workers', async ({ page }, testInfo) => {
  const source = page.locator('#source-ide')
  const preview = page.locator('#preview-ide')
  await source.getByRole('treeitem', { exact: true, name: 'src' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'instructions.ts' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'instructions.ts Close' })).toBeVisible()
  const sourceUid = await source.locator('.Editor').getAttribute('data-uid')
  const previewUid = await preview.locator('.Editor').getAttribute('data-uid')
  const sharedWorkers = page.workers().filter((worker) => /(?:renderer|editor|mainArea)WorkerMain/.test(worker.url()))
  expect(sharedWorkers.length).toBeGreaterThan(0)
  const timings: number[] = []
  for (let index = 1; index <= 3; index++) {
    await source.locator('.Editor').click()
    await source.locator('.Editor textarea').focus()
    await page.keyboard.press('Control+a')
    await page.keyboard.insertText(`export const instructions = 'Imported file revision ${index}'`)
    await page.keyboard.press('Control+s')
    await expect(preview.locator('.Editor')).toContainText(`Imported file revision ${index}`, { timeout: 30_000 })
    await expect(source.locator('.Editor')).toHaveAttribute('data-uid', sourceUid!)
    await expect(preview.locator('.Editor')).toHaveAttribute('data-uid', previewUid!)
    for (const worker of sharedWorkers) expect(page.workers()).toContain(worker)
    const ids = await page.locator('[id]').evaluateAll((elements) => elements.map((element) => element.id))
    expect(new Set(ids).size).toBe(ids.length)
    const uids = await page.locator('.Viewlet[data-uid]').evaluateAll((elements) => elements.map((element) => element.dataset.uid))
    expect(new Set(uids).size).toBe(uids.length)
    timings.push(Number(await page.locator('body').getAttribute('data-preview-build-ms')))
  }
  await testInfo.attach('warm-preview-rebuilds-ms', { body: JSON.stringify(timings), contentType: 'application/json' })
  await page.reload()
  await expect(preview.locator('.Editor')).toContainText('Imported file revision 3', { timeout: 30_000 })
})

test('a compile error keeps the last working preview and saving a correction recovers', async ({ page }) => {
  const source = page.locator('#source-ide')
  const preview = page.locator('#preview-ide')
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.insertText('const broken = ;\n')
  await expect(source.locator('.Editor')).toContainText('const broken = ;')
  await page.keyboard.press('Control+s')
  await expect(page.getByRole('status')).toContainText('Build failed')
  await expect(preview.locator('.Editor')).toContainText('Hello from memfs')
  await page.keyboard.press('Control+z')
  await page.keyboard.press('Control+s')
  await expect(page.getByRole('status')).toHaveText('Preview ready')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
})

test('editing the provider workspace does not save or rebuild the source application', async ({ page }) => {
  const preview = page.locator('#preview-ide')
  const source = page.locator('#source-ide')
  await preview.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText('Written through the sample filesystem provider')
  await page.keyboard.press('Control+s')
  await expect(preview.locator('.Editor')).toContainText('Written through the sample filesystem provider')
  await expect(preview.getByRole('tab', { exact: true, name: 'README.md Close' })).toBeVisible()
  await preview.getByRole('treeitem', { exact: true, name: 'src' }).click()
  await preview.getByRole('treeitem', { exact: true, name: 'example.ts' }).click()
  await expect(preview.locator('.Editor')).toContainText('Hello from an extension file system')
  await preview.getByRole('treeitem', { exact: true, name: 'README.md' }).click()
  await expect(preview.locator('.Editor')).toContainText('Written through the sample filesystem provider')
  await expect(source.locator('.Editor')).toContainText('registerFileSystemProvider')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '1')
})

test('reloads the currently open provider file without switching back to README', async ({ page }) => {
  const source = page.locator('#source-ide')
  const preview = page.locator('#preview-ide')
  await preview.getByRole('treeitem', { exact: true, name: 'src' }).click()
  await preview.getByRole('treeitem', { exact: true, name: 'example.ts' }).click()
  await expect(preview.locator('.Editor')).toContainText('Hello from an extension file system')
  const previewUid = await preview.locator('.Editor').getAttribute('data-uid')
  const response = await page.request.get('/extension-samples/samples/file-system-provider/files.json')
  const files = await response.json()
  await source.locator('.Editor').click()
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('Hello from an extension file system', 'Updated provider file'))
  await page.keyboard.press('Control+s')
  await expect(preview.locator('.Editor')).toContainText('Updated provider file')
  await expect(preview.locator('.Editor')).toHaveAttribute('data-uid', previewUid!)
  await expect(preview.getByRole('tab', { exact: true, name: 'example.ts Close' })).toHaveAttribute('aria-selected', 'true')
})
