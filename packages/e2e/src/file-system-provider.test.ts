import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.frameLocator('#workbench-frame').locator('.Editor')).toHaveCount(2, { timeout: 30_000 })
})

test('opens two real LVCE editors with TypeScript highlighting and the file-system preview', async ({ page }) => {
  await expect(page).toHaveTitle('File System Provider · Lvce Editor Extension Samples')
  await expect(page.getByLabel('Extension sample', { exact: true })).toHaveValue('file-system-provider')

  const workbench = page.frameLocator('#workbench-frame')
  await expect(workbench.getByRole('tab', { name: 'main.ts' })).toBeVisible()
  await expect(workbench.getByRole('tab', { name: 'README.md' })).toBeVisible()
  await expect(workbench.locator('.Editor').first().locator('.Token.KeywordImport').first()).toHaveText('import')
  const previewEditor = workbench.locator('.Editor').nth(1)
  await expect(previewEditor).toContainText('# Hello from memfs')
  await expect(workbench.locator('.TitleBar:visible, .ActivityBar:visible, .StatusBar:visible, .SideBar:visible')).toHaveCount(0)
})

test('runs the built-in ESLint extension in the source editor', async ({ page }) => {
  const workbench = page.frameLocator('#workbench-frame')
  const sourceEditor = workbench.locator('.Editor').first()
  await sourceEditor.locator('textarea').focus()
  await page.keyboard.press('Control+Home')
  await page.keyboard.type('debugger;')

  await expect(sourceEditor.locator('.EditorRow').first()).toContainText('debugger;')
  await expect(sourceEditor.locator('.LayerDiagnostics .DiagnosticError')).toHaveCount(1, { timeout: 20_000 })
})

test('saving TypeScript rebuilds and refreshes the provider preview', async ({ page }) => {
  const workbench = page.frameLocator('#workbench-frame')
  const sourceEditor = workbench.locator('.Editor').first()
  await sourceEditor.locator('textarea').focus()
  await page.keyboard.press('Control+f')
  const findInput = workbench.locator('textarea[name="search-value"]')
  await findInput.fill('Hello from memfs')
  await page.keyboard.press('Escape')
  await expect(findInput).toBeHidden()
  await page.keyboard.type('Edited live in LVCE: ', { delay: 30 })
  await page.keyboard.press('Control+s')

  const previewEditor = workbench.locator('.Editor').nth(1)
  await expect(previewEditor).toContainText('Edited live in LVCE:', { timeout: 30_000 })
})
