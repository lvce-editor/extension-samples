import { expect, test } from '@playwright/test'

test('opens the real LVCE source-control view beside the sample source', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  const workbench = page.frameLocator('#workbench-frame')

  await expect(workbench.locator('.Editor')).toHaveCount(1, { timeout: 30_000 })
  await expect(workbench.locator('.SecondarySideBar')).toBeVisible()
  await expect(workbench.locator('.Editor').first().locator('.Token.KeywordImport').first()).toHaveText('import')
  await expect(workbench.locator('.SourceControl')).toContainText('Changes')
  await expect(workbench.locator('.SourceControl')).toContainText('README.md')
  await expect(workbench.locator('.SourceControl')).toContainText('main.ts')
  await expect(workbench.locator('.SourceControlBadge')).toHaveText('2')
  await expect(workbench.locator('.TitleBar:visible, .ActivityBar:visible, .StatusBar:visible')).toHaveCount(0)
})
