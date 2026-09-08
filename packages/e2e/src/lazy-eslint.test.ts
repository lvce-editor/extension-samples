import { expect, test } from '@playwright/test'

const evaluationWorker = /eslintEvaluationWorkerMain\.js/

test('diagnostic sample skips evaluation until editing and clears diagnostics on undo', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => {
    if (evaluationWorker.test(request.url())) requests.push(request.url())
  })
  await page.goto('/extension-samples/diagnostic-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide .Editor')
  const diagnostics = source.locator('.LayerDiagnostics .DiagnosticError')
  await expect(page.locator('#preview-ide .DiagnosticError')).toHaveCount(2)
  await expect(diagnostics).toHaveCount(0)
  // Explicitly request diagnostics to synchronize with the hash check.
  const original = await page.request.get('/extension-samples/samples/diagnostic-provider/files.json')
  const files = await original.json()
  const runtimeResponse = await page.request.get('/extension-samples/runtime.json')
  const runtime = await runtimeResponse.json()
  await page.evaluate(
    async ({ entry, text }) => {
      const renderer = await import(entry)
      const result = await renderer.executeCommand('Application.execute', 'source', 'ExtensionHost.executeCommand', 'eslint.lint', {
        text,
        uri: 'memfs:///sample/src/main.ts',
      })
      if (result.length > 0) throw new Error('Expected ignored source to have no diagnostics')
    },
    { entry: runtime.entry, text: files['/src/main.ts'] },
  )
  expect(requests).toEqual([])
  expect(page.workers().filter((worker) => evaluationWorker.test(worker.url()))).toHaveLength(0)
  await source.locator('textarea').focus()
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText('\nexport type Unsafe = any\n')
  await expect(diagnostics).toHaveCount(1, { timeout: 30_000 })
  expect(requests.length).toBeGreaterThan(0)
  await page.keyboard.press('Control+z')
  await expect(diagnostics).toHaveCount(0)
})

test('a restored edited draft is linted instead of added to ignored hashes', async ({ page }) => {
  const response = await page.request.get('/extension-samples/samples/diagnostic-provider/files.json')
  const files = await response.json()
  files['/src/main.ts'] += '\nexport type Unsafe = any\n'
  await page.addInitScript((files) => localStorage.setItem('extension-samples:workspace:diagnostic-provider', JSON.stringify(files)), files)
  await page.goto('/extension-samples/diagnostic-provider/')
  await expect(page.locator('#source-ide .LayerDiagnostics .DiagnosticError')).toHaveCount(1, { timeout: 30_000 })
})
