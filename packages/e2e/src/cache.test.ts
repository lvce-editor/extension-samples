import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

const nonEmptyLine = /\S/

test('build artifact cache reads back its blob and removes the temporary entry', async ({ page }) => {
  await page.goto('/extension-samples/output-channel/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const lines = page.locator('#preview-ide .OutputContent > .Line').filter({ hasText: nonEmptyLine })
  await runCommand(page, 'Sample: Cache Build Artifact')
  await expect(lines).toHaveText([
    'Ready. Run Sample: Run Build from the command palette.',
    'Cached artifact: Compiled sample artifact',
    'Artifact removed: true',
  ])
  await runCommand(page, 'Sample: Cache Build Artifact')
  await expect(lines).toHaveCount(5)
  await expect(lines.last()).toHaveText('Artifact removed: true')
})
