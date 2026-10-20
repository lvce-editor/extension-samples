import { expect, test } from '@playwright/test'

test('every published sample includes a gitignore for dependencies and build output', async ({ request }) => {
  const response = await request.get('/extension-samples/samples.json')
  expect(response.ok()).toBe(true)
  const samples = (await response.json()) as { id: string }[]
  expect(samples.length).toBeGreaterThan(0)
  for (const sample of samples) {
    const response = await request.get(`/extension-samples/samples/${sample.id}/files.json`)
    expect(response.ok()).toBe(true)
    const files = await response.json()
    expect(files['/.gitignore']?.split('\n')).toEqual(expect.arrayContaining(['node_modules/', 'dist/', '*.tsbuildinfo']))
  }
})

test('gitignore is visible and opens in the source editor', async ({ page }) => {
  await page.goto('/extension-samples/file-view/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: '.gitignore' }).click()
  await expect(source.locator('.Editor')).toContainText('node_modules/')
  await expect(source.locator('.Editor')).toContainText('dist/')
  await expect(source.locator('.Editor')).toContainText('*.tsbuildinfo')
})
