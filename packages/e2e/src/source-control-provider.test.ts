import { expect, test } from '@playwright/test'

test('runs source control actions in the static preview', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const preview = page.frameLocator('#preview-frame')

  await expect(preview.locator('body')).toHaveAttribute('data-preview-ready', 'true')
  await expect(preview.locator('.ProviderTitle')).toHaveText('Source Control · sampleSourceControl')
  await expect(preview.locator('.ChangeRow')).toHaveCount(2)

  await preview.getByTitle('Generate commit message').click()
  await expect(preview.getByLabel('Commit message')).toHaveValue('feat: update extension sample')
  await preview.getByRole('button', { name: 'Commit' }).click()
  await expect(preview.locator('.ChangeRow')).toHaveCount(0)
  await expect(preview.locator('[data-preview-message]')).toContainText('Committed: feat: update extension sample')
})
