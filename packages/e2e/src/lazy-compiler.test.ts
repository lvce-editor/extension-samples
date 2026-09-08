import { expect, test, type Worker } from '@playwright/test'

const compilerAsset = /\/assets\/(?:compiler\.js|esbuild\.wasm|api\.js)$/

for (const sample of ['file-system-provider', 'source-control-provider']) {
  test(`${sample} opens its precompiled preview without loading the compiler`, async ({ page }) => {
    const requests: string[] = []
    await page.route(compilerAsset, async (route) => {
      requests.push(route.request().url())
      await route.abort()
    })
    await page.goto(`/extension-samples/${sample}/`)
    await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
    await expect(page.locator('#preview-status')).toHaveText('Preview ready')
    await expect(page.locator('#source-ide .Editor')).toHaveCount(1)
    await expect(page.locator('#preview-ide .Editor')).toContainText(sample === 'file-system-provider' ? 'Hello from memfs' : 'Preview workspace')
    if (sample === 'source-control-provider') await expect(page.locator('#preview-ide .DecorationIcon').first()).toHaveJSProperty('naturalWidth', 16)
    const previewWorker = page.workers().find((worker) => worker.url().endsWith(`/samples/${sample}/main.js`))
    expect(previewWorker?.url()).toBe(new URL(`/extension-samples/samples/${sample}/main.js`, page.url()).href)
    expect(requests).toEqual([])
    expect(page.workers().filter((worker) => worker.url().endsWith('/assets/compiler.js'))).toHaveLength(0)
  })
}

test('an unchanged saved workspace still uses the precompiled preview', async ({ page }) => {
  const response = await page.request.get('/extension-samples/samples/file-system-provider/files.json')
  const files = await response.json()
  await page.addInitScript((files) => {
    localStorage.setItem('extension-samples:workspace:file-system-provider', JSON.stringify(files))
  }, files)
  const requests: string[] = []
  page.on('request', (request) => {
    if (compilerAsset.test(request.url())) requests.push(request.url())
  })
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-ide .Editor')).toContainText('Hello from memfs')
  expect(requests).toEqual([])
})

test('loads the compiler on the first saved edit and restores edited drafts', async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const compilerWorkers = (): Worker[] => page.workers().filter((worker) => worker.url().endsWith('/assets/compiler.js'))
  expect(compilerWorkers()).toHaveLength(0)
  const response = await page.request.get('/extension-samples/samples/file-system-provider/files.json')
  const files = await response.json()
  const source = page.locator('#source-ide .Editor')
  const preview = page.locator('#preview-ide .Editor')
  for (let revision = 1; revision <= 2; revision++) {
    const existingCompiler = compilerWorkers()[0]
    await source.locator('textarea').focus()
    await page.keyboard.press('Control+a')
    await page.keyboard.insertText(files['/src/main.ts'].replace('Hello from memfs', () => `Lazy compiler revision ${revision}`))
    await expect(source).toContainText(`Lazy compiler revision ${revision}`)
    if (revision === 1) expect(compilerWorkers()).toHaveLength(0)
    await page.keyboard.press('Control+s')
    await expect(preview).toContainText(`Lazy compiler revision ${revision}`, { timeout: 30_000 })
    expect(compilerWorkers()).toHaveLength(1)
    if (existingCompiler) expect(compilerWorkers()[0]).toBe(existingCompiler)
  }
  await page.reload()
  await expect(preview).toContainText('Lazy compiler revision 2', { timeout: 30_000 })
  expect(compilerWorkers()).toHaveLength(1)
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(preview).toContainText('Hello from memfs')
  expect(compilerWorkers()).toHaveLength(0)
})
