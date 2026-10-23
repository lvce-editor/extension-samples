import { expect, test, type Page } from '@playwright/test'

const htmlPreviewUrl = /\/extension-samples\/html-preview\/$/
const completionPreviewUrl = /\/extension-samples\/completion-provider\/$/

const expectAlphabeticalSamples = async (page: Page): Promise<void> => {
  const response = await page.request.get('/extension-samples/samples.json')
  const samples = await response.json()
  const options = await page
    .locator('#sample-picker option')
    .evaluateAll((elements) => elements.map((element) => ({ label: element.textContent, value: (element as HTMLOptionElement).value })))
  expect(options).toEqual(
    [...samples].toSorted((a, b) => a.title.localeCompare(b.title)).map((sample) => ({ label: sample.title, value: sample.route })),
  )
  expect(new Set(options.map((option) => option.value)).size).toBe(samples.length)
}

test('sorts all sample options by title and preserves the selected sample', async ({ page }) => {
  await page.goto('/extension-samples/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expectAlphabeticalSamples(page)

  await page.goto('/extension-samples/source-control-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.getByLabel('Extension sample', { exact: true })).toHaveValue('source-control-provider')
  await expectAlphabeticalSamples(page)

  await page.getByLabel('Extension sample', { exact: true }).selectOption('completion-provider')
  await expect(page).toHaveURL(completionPreviewUrl)
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
})

test('removes the legacy applicationHost parameter after startup and preserves the rest of the URL', async ({ page }) => {
  await page.goto('/extension-samples/file-system-provider/?applicationHost=1&campaign=trello#readme')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')

  const url = new URL(page.url())
  expect(url.searchParams.has('applicationHost')).toBe(false)
  expect(url.searchParams.get('campaign')).toBe('trello')
  expect(url.hash).toBe('#readme')

  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')
  await expect(page.locator('#source-ide .Editor')).toHaveCount(1)

  await page.getByLabel('Extension sample', { exact: true }).selectOption('html-preview')
  await expect(page).toHaveURL(htmlPreviewUrl)
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  expect(new URL(page.url()).searchParams.has('applicationHost')).toBe(false)
})
