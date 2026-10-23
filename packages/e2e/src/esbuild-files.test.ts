import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { getEsbuildBinaryPath } from '../../build/src/getEsbuildBinaryPath.ts'

const require = createRequire(import.meta.url)
const buildRequire = createRequire(new URL('../../build/package.json', import.meta.url))
const root = 'sample-source:///sample/node_modules'

const execute = async (page: Page, command: string, ...args: readonly unknown[]): Promise<any> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  const outcome = await page.evaluate(
    async ({ args, command, entry }) => {
      const renderer = await import(entry)
      try {
        return { result: await renderer.executeCommand('Application.execute', 'source', command, ...args) }
      } catch (error) {
        // Preserve the application error name across Playwright's evaluation boundary.
        const value = error as Error
        return { error: { message: value.message, name: value.name } }
      }
    },
    { args, command, entry },
  )
  if (outcome.error) {
    throw Object.defineProperty(new Error(outcome.error.message), 'name', { value: outcome.error.name })
  }
  return outcome.result
}

test('esbuild package and CLI entries are visible, authentic, and lazy', async ({ page }) => {
  const binaryRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('/esbuild-bin')) binaryRequests.push(request.url())
  })
  await page.goto('/extension-samples/file-view-counter/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: 'node_modules' }).click()
  await expect(source.getByRole('treeitem', { exact: true, name: 'esbuild' })).toBeVisible()
  const modules = await execute(page, 'FileSystem.readDirWithFileTypes', root)
  for (const name of ['esbuild', '.bin', 'eslint', 'typescript-eslint', 'eslint-plugin-unicorn', '@lvce-editor']) {
    expect(modules).toContainEqual({ name, type: 3 })
  }
  await source.getByRole('treeitem', { exact: true, name: 'esbuild' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'bin' }).click()
  await expect(source.getByRole('treeitem', { exact: true, name: 'esbuild' })).toHaveCount(2)
  for (const directory of [`${root}/esbuild/bin`, `${root}/.bin`]) {
    expect(await execute(page, 'FileSystem.readDirWithFileTypes', directory)).toEqual([{ name: 'esbuild', type: 7 }])
  }
  const esbuildRoot = dirname(require.resolve('esbuild/package.json'))
  for (const path of ['package.json', 'lib/main.js', 'lib/main.d.ts']) {
    expect(await execute(page, 'FileSystem.readFile', `${root}/esbuild/${path}`)).toBe(await readFile(join(esbuildRoot, path), 'utf8'))
  }
  expect(binaryRequests).toEqual([])
  const bytes = await readFile(getEsbuildBinaryPath())
  const response = await page.request.get('/extension-samples/esbuild-bin')
  expect(response.ok()).toBe(true)
  expect(await response.body()).toEqual(bytes)
  let text: string | undefined
  try {
    if (!bytes.includes(0)) text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    // A native executable has no text representation.
  }
  for (const uri of [`${root}/esbuild/bin/esbuild`, `${root}/.bin/esbuild`]) {
    if (text === undefined) {
      await expect(execute(page, 'FileSystem.readFile', uri)).rejects.toMatchObject({ name: 'BinaryFileError' })
      expect(await execute(page, 'FileSystem.readFile', uri, 'binary')).toBe(new TextDecoder().decode(bytes))
    } else expect(await execute(page, 'FileSystem.readFile', uri)).toBe(text)
    await expect(execute(page, 'FileSystem.writeFile', uri, 'overwrite')).rejects.toThrow('read-only')
    await expect(execute(page, 'FileSystem.readDirWithFileTypes', uri)).rejects.toThrow('Not a directory')
  }
  expect(page.workers().filter((worker) => worker.url().endsWith('/assets/compiler.js'))).toHaveLength(0)
  expect(await page.evaluate(() => globalThis.localStorage.getItem('extension-samples:workspace:file-view-counter'))).toBeNull()
})

test('opens a native esbuild executable as text when requested', async ({ page }) => {
  await page.goto('/extension-samples/file-view-counter/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const source = page.locator('#source-ide')
  const bytes = await readFile(getEsbuildBinaryPath())
  let isText = false
  try {
    if (!bytes.includes(0)) {
      new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      isText = true
    }
  } catch {
    // Native executables are the behavior under test.
  }
  if (isText) {
    test.skip(true, 'The platform esbuild entry is already text')
    return
  }
  await source.getByRole('treeitem', { exact: true, name: 'node_modules' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'esbuild' }).first().click()
  await source.getByRole('treeitem', { exact: true, name: 'bin' }).click()
  await expect(source.getByRole('treeitem', { exact: true, name: 'esbuild' })).toHaveCount(2)
  await source.getByRole('treeitem', { exact: true, name: 'esbuild' }).last().click()

  const binaryContent = page.locator('.EditorContentBinary')
  await expect(binaryContent).toHaveText('The file is not displayed in the text editor because its contents are binary.Reopen with Text Editor')
  await expect(page.getByRole('button', { name: 'Retry' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Reopen with Text Editor' }).click()
  await expect(binaryContent).toBeHidden()
  await expect(source.locator('.EditorContent')).toBeVisible()
  await expect(source.locator('.TabTitle').filter({ hasText: 'esbuild' })).toHaveCount(1)
})

test('playground packages declarations for the API virtual DOM exports', async ({ page }) => {
  await page.goto('/extension-samples/file-view-counter/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const apiDeclaration = await execute(page, 'FileSystem.readFile', `${root}/@lvce-editor/api/dist/index.d.ts`)
  const virtualDomWorkerDeclaration = await execute(page, 'FileSystem.readFile', `${root}/@lvce-editor/virtual-dom-worker/dist/parts/Main/Main.d.ts`)
  const constantsDeclaration = await execute(page, 'FileSystem.readFile', `${root}/@lvce-editor/constants/dist/parts/Main/Main.d.ts`)

  expect(apiDeclaration).toContain('VirtualDomElements')
  expect(virtualDomWorkerDeclaration).toContain('@lvce-editor/constants')
  expect(constantsDeclaration).toContain('VirtualDomElements')
})

test('playground packages and opens authentic API runtime files', async ({ page }) => {
  await page.goto('/extension-samples/file-view-counter/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide')
  const apiRoot = dirname(dirname(buildRequire.resolve('@lvce-editor/api')))
  for (const path of ['dist/index.js', 'dist/parts/Activation/Activation.js']) {
    const expected = await readFile(join(apiRoot, path), 'utf8')
    expect(await execute(page, 'FileSystem.readFile', `${root}/@lvce-editor/api/${path}`)).toBe(expected)
  }

  await source.getByRole('treeitem', { exact: true, name: 'node_modules' }).click()
  await source.getByRole('treeitem', { exact: true, name: '@lvce-editor' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'api' }).click()
  await source.getByRole('treeitem', { description: `${root}/@lvce-editor/api/dist`, exact: true, name: 'dist' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'index.js' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'index.js Close' })).toBeVisible()
  await expect(source.locator('.Editor')).toContainText('export { activate }')
  await source.getByRole('treeitem', { exact: true, name: 'parts' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'Activation' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'Activation.js' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'Activation.js Close' })).toBeVisible()
  await expect(source.locator('.Editor')).toContainText('ExtensionManagementWorker')
})
