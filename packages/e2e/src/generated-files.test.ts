import { expect, test, type Page } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

const execute = async (page: Page, command: string, ...args: readonly unknown[]): Promise<any> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  return page.evaluate(
    async ({ args, command, entry }) => {
      const renderer = await import(entry)
      return renderer.executeCommand('Application.execute', 'source', command, ...args)
    },
    { args, command, entry },
  )
}

const openGenerated = async (page: Page): Promise<void> => {
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: 'dist' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'main.js' }).click()
}

for (const sample of ['hello-world', 'file-system-provider']) {
  test(`${sample} lists and lazily opens the package bundle`, async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/dist/main.js')) requests.push(request.url())
    })
    await page.goto(`/extension-samples/${sample}/`)
    await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
    await expect(page.locator('#source-ide').getByRole('treeitem', { exact: true, name: 'dist' })).toBeVisible()
    expect(requests).toEqual([])
    await openGenerated(page)
    const source = page.locator('#source-ide .Editor')
    await expect(source).toContainText('@lvce-editor/api')
    await expect(source).toContainText(sample === 'hello-world' ? 'Hello World!' : 'Hello from memfs')
    expect(requests.length).toBeGreaterThan(0)
    expect(page.workers().filter((worker) => worker.url().endsWith('/assets/compiler.js'))).toHaveLength(0)
    const editable = await execute(page, 'FileSystem.readDirWithFileTypes', 'memfs:///sample')
    await expect(execute(page, 'FileSystem.writeFile', 'sample-source:///sample/dist/main.js', 'overwrite')).rejects.toThrow('read-only')
    expect(editable.some((entry: { name: string }) => entry.name === 'dist')).toBe(false)
    expect(await page.evaluate((sample) => globalThis.localStorage.getItem(`extension-samples:workspace:${sample}`), sample)).toBeNull()
  })
}

test('generated output follows successful saves, survives failed builds, and resets with drafts', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const response = await page.request.get('/extension-samples/samples/hello-world/files.json')
  const files = await response.json()
  const edited = files['/src/main.ts'].replace('Hello World!', 'Generated revision!')
  const source = page.locator('#source-ide .Editor')
  await source.locator('textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(edited)
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await openGenerated(page)
  await expect(source).toContainText('Generated revision!')
  await expect(source).toContainText('@lvce-editor/api')
  await runCommand(page, 'Sample: Hello World')
  await expect(page.locator('#preview-ide .NotificationMessage')).toHaveText('Generated revision!')
  // Keep the generated editor open to exercise invalidation, including failed builds.
  await execute(page, 'FileSystem.writeFile', 'memfs:///sample/src/main.ts', 'export const broken = ;')
  await expect(page.locator('#preview-status')).toContainText('Error')
  await expect(source).toContainText('Generated revision!')
  await execute(page, 'FileSystem.writeFile', 'memfs:///sample/src/main.ts', edited.replace('Generated revision!', 'Next generated revision!'))
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '3')
  await expect(source).toContainText('Next generated revision!')
  const draft = await page.evaluate(() => JSON.parse(globalThis.localStorage.getItem('extension-samples:workspace:hello-world')!))
  expect(Object.keys(draft).some((path) => path.startsWith('/dist/'))).toBe(false)
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await openGenerated(page)
  await expect(source).toContainText('Next generated revision!')
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await openGenerated(page)
  await expect(source).toContainText('Hello World!')
  await expect(source).not.toContainText('Next generated revision!')
  expect(page.workers().filter((worker) => worker.url().endsWith('/assets/compiler.js'))).toHaveLength(0)
})
