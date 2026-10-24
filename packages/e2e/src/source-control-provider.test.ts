import { expect, test } from '@playwright/test'
import { resetSample } from './PlaygroundControls.ts'

test('opens the real LVCE source-control view beside the sample source', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const workbench = page.locator('#preview-ide')

  await expect(workbench.locator('.Editor')).toHaveCount(1, { timeout: 30_000 })
  await expect(page.locator('#source-ide .Editor .Token.KeywordImport').first()).toHaveText('import')
  await expect(workbench.locator('.SourceControl')).toContainText('Changes')
  await expect(workbench.locator('.SourceControl')).toContainText('README.md')
  await expect(workbench.locator('.SourceControl')).toContainText('main.ts')
  await expect(workbench.locator('.SourceControlBadge')).toHaveText('2')
  await expect(workbench.locator('.DecorationIcon')).toHaveCount(2)
  await expect(workbench.locator('.DecorationIcon').first()).toHaveJSProperty('naturalWidth', 16)
  await expect(workbench.locator('.ActivityBar')).toBeVisible()
  await expect(workbench.locator('.TitleBar:visible')).toHaveCount(0)
  await expect(workbench.locator('.StatusBar:visible')).toHaveCount(1)
  await expect(page.locator('#source-ide .ActivityBar:visible')).toHaveCount(0)
  const explorerTab = workbench.getByRole('tab', { name: 'Explorer' })
  const sourceControlTab = workbench.getByRole('tab', { name: 'Source Control' })
  await explorerTab.click()
  await expect(explorerTab).toHaveAttribute('aria-selected', 'true')
  await expect(workbench.getByRole('tree', { name: 'Files Explorer' })).toBeVisible()
  await expect(workbench.locator('.SourceControl')).toBeHidden()
  await sourceControlTab.click()
  await expect(sourceControlTab).toHaveAttribute('aria-selected', 'true')
  await expect(workbench.locator('.SourceControl')).toBeVisible()
  await expect(workbench.getByRole('tree', { name: 'Files Explorer' })).toBeHidden()
  const runtimeResponse = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await runtimeResponse.json()
  const openFile = async (uri: string): Promise<void> => {
    await page.evaluate(
      async ({ entry, uri }) => {
        const renderer = await import(entry)
        await renderer.executeCommand('Application.execute', 'preview', 'Main.openUri', uri)
      },
      { entry, uri },
    )
  }
  await openFile('memfs:///preview/README.md')
  await expect(workbench.locator('.Editor')).toContainText('These files are stored in a memfs volume.')
  await openFile('memfs:///preview/src/main.ts')
  await expect(workbench.locator('.Editor')).toContainText('Hello from the source-control memfs workspace')
})

test('initializes and reloads the source-control preview without worker rejections', async ({ page }) => {
  const pageErrors: Error[] = []
  const unhandledRejections: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error)
  })
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Unhandled Rejection')) {
      unhandledRejections.push(message.text())
    }
  })

  await page.goto('/extension-samples/source-control-provider/')
  const preview = page.locator('#preview-ide')
  await expect(preview.locator('.SourceControl')).toContainText('Changes', { timeout: 30_000 })
  await expect(preview.locator('.SourceControl')).toContainText('README.md')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')

  await page.reload()
  await expect(preview.locator('.SourceControl')).toContainText('Changes', { timeout: 30_000 })
  await expect(preview.locator('.SourceControl')).toContainText('main.ts')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(preview.getByRole('tab', { name: 'Explorer' })).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(unhandledRejections).toEqual([])
})

test('discards changed files individually from the source-control view', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const workbench = page.locator('#preview-ide')
  const sourceControl = workbench.locator('.SourceControl')
  const changedFiles = sourceControl.locator('.TreeItem')

  await expect(sourceControl.locator('.SourceControlBadge')).toHaveText('2', { timeout: 30_000 })
  await expect(changedFiles).toHaveCount(3)
  const firstFile = changedFiles.nth(1)
  await firstFile.hover()
  await firstFile.locator('.SourceControlButton[name="Discard"]').click()
  await expect(sourceControl.locator('.SourceControlBadge')).toHaveText('1')
  await expect(changedFiles).toHaveCount(2)

  const remainingFile = changedFiles.nth(1)
  await remainingFile.hover()
  await remainingFile.locator('.SourceControlButton[name="Discard"]').click()
  await expect(sourceControl.locator('.SourceControlBadge')).toHaveCount(0)
  await expect(changedFiles).toHaveCount(0)
})

test('keeps the source-control preview activity bar visible after resize, reload, and reset', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const preview = page.locator('#preview-ide')
  await expect(preview.locator('.ActivityBar')).toBeVisible()

  const divider = page.getByRole('separator', { name: 'Resize source and preview' })
  await divider.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(preview.locator('.ActivityBar')).toBeVisible()

  await page.reload()
  await expect(preview.locator('.SourceControl')).toBeVisible()
  await expect(preview.locator('.ActivityBar')).toBeVisible()

  await resetSample(page)
  await expect(preview.locator('.SourceControl')).toBeVisible()
  await expect(preview.locator('.ActivityBar')).toBeVisible()
})

test('opens the manifest from Explorer and recovers from a missing decoration icon', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const source = page.locator('#source-ide')
  const preview = page.locator('#preview-ide')
  await expect(preview.locator('.DecorationIcon')).toHaveCount(2, { timeout: 30_000 })
  await source.getByRole('treeitem', { exact: true, name: 'extension.json' }).click()
  await expect(source.getByRole('tab', { exact: true, name: 'extension.json Close' })).toBeVisible()
  await expect(source.locator('.Editor')).toContainText('icons/modified.svg')
  const response = await page.request.get('/extension-samples/samples/source-control-provider/files.json')
  const files = await response.json()
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/extension.json'].replace('icons/modified.svg', 'icons/missing.svg'))
  await expect(source.locator('.Editor')).toContainText('icons/missing.svg')
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('#preview-status')).toContainText('Missing icon:')
  await expect(preview.locator('.DecorationIcon')).toHaveCount(2)
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/extension.json'])
  await expect(source.locator('.Editor')).toContainText('icons/modified.svg')
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(preview.locator('.ActivityBar')).toBeVisible()
  await expect(source.getByRole('tab', { exact: true, name: 'extension.json Close' })).toBeVisible()
})

test('edits an SVG decoration as source and reloads the image in the preview', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const source = page.locator('#source-ide')
  const preview = page.locator('#preview-ide')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const icon = preview.locator('.DecorationIcon').first()
  await expect(icon).toHaveJSProperty('naturalWidth', 16)
  const originalIconUrl = await icon.evaluate((element) => (element as HTMLImageElement).src)
  await source.getByRole('treeitem', { exact: true, name: 'icons' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'modified.svg' }).click()
  await expect(source.locator('.Editor')).toContainText('<svg')
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="6" fill="red"/></svg>')
  await expect(source.locator('.Editor')).toContainText('<circle')
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(icon).not.toHaveAttribute('src', originalIconUrl)
  await expect(icon).toHaveJSProperty('naturalWidth', 16)
  const svg = await icon.evaluate(async (element) => {
    const response = await fetch((element as HTMLImageElement).src)
    return response.text()
  })
  expect(svg).toContain('fill="red"')
  await expect(source.getByRole('tab', { name: 'modified.svg' })).toBeVisible()
})
