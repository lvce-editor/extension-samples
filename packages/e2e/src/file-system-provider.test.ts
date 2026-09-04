import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/')
  await expect(page.getByRole('status')).toHaveAttribute('data-state', 'success')
})

test('opens the sample in a focused workbench layout', async ({ page }) => {
  await expect(page).toHaveTitle('File System Provider · Lvce Editor Extension Samples')
  await expect(page.getByLabel('Collapsed sidebar')).toBeVisible()
  await expect(page.locator('.TitleBar, .StatusBar, .ActivityBar')).toHaveCount(0)
  await expect(page.getByLabel('TypeScript extension source')).toHaveValue(/registerFileSystemProvider/)

  const preview = page.frameLocator('#preview-frame')
  await expect(preview.locator('body')).toHaveAttribute('data-preview-ready', 'true')
  await expect(preview.locator('.ProviderTitle')).toHaveText('File system · memfs')
  await expect(preview.locator('.FileContent')).toContainText('Hello from memfs')
})

test('saving TypeScript rebuilds and persists the live preview', async ({ page }) => {
  const editor = page.getByLabel('TypeScript extension source')
  const source = await editor.inputValue()
  await editor.fill(source.replace('Hello from memfs', 'Edited in the browser'))
  await expect(page.getByLabel('Unsaved changes')).toHaveText('●')
  await editor.press('Control+s')

  await expect(page.getByRole('status')).toContainText('Saved and rebuilt')
  const preview = page.frameLocator('#preview-frame')
  await expect(preview.locator('.FileContent')).toContainText('Edited in the browser')

  await page.reload()
  await expect(page.getByLabel('TypeScript extension source')).toHaveValue(/Edited in the browser/)
  await expect(page.frameLocator('#preview-frame').locator('.FileContent')).toContainText('Edited in the browser')
})

test('reports browser bundle errors without replacing the source', async ({ page }) => {
  const editor = page.getByLabel('TypeScript extension source')
  await editor.fill('const broken =')
  await page.getByRole('button', { name: 'Save & run' }).click()

  await expect(page.getByRole('status')).toHaveAttribute('data-state', 'error')
  await expect(editor).toHaveValue('const broken =')
})
