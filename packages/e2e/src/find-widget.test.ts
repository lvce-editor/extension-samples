import { expect, test } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'
import { resetSample } from './PlaygroundControls.ts'
import { runSelectedCommand } from './RunSelectedCommand.ts'

test('extension opens the find widget and searches the preview document', async ({ page }) => {
  await page.goto('/extension-samples/find-widget/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  const findInput = page.locator('#preview-ide .FindWidget .MultilineInputBox')
  const matchCount = page.locator('#preview-ide .FindWidgetMatchCount')

  await expect(findInput).toBeVisible()
  await expect(page.locator('#source-ide .FindWidget')).toHaveCount(0)
  await expect(findInput).toHaveValue('matching phrase')
  await expect(matchCount).toHaveText('1 of 1')
  await expect(editor.locator('.EditorRow')).toHaveText(['Find the matching phrase in this preview.', 'Another line stays unchanged.', ''])

  await runSelectedCommand(page, 'Sample: Find Phrase')
  await expect(findInput).toBeVisible()
  await expect(page.locator('#source-ide .FindWidget')).toHaveCount(0)
  await expect(findInput).toHaveValue('matching phrase')
  await expect(matchCount).toHaveText('1 of 1')
  await expect(editor.locator('.EditorRow')).toHaveText(['Find the matching phrase in this preview.', 'Another line stays unchanged.', ''])

  await expect(findInput).toBeFocused()

  const response = await page.request.get('/extension-samples/samples/find-widget/files.json')
  const files = await response.json()
  await focusEditor(page, 'source')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(files['/src/main.ts'].replace('matching phrase', 'preview'))
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready')

  await runSelectedCommand(page, 'Sample: Find Phrase')
  await expect(findInput).toHaveValue('preview')
  await expect(matchCount).toHaveText('1 of 1')
  await expect(editor.locator('.EditorRow')).toHaveText(['Find the matching phrase in this preview.', 'Another line stays unchanged.', ''])

  await resetSample(page)
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await expect(findInput).toBeVisible()
  await expect(findInput).toHaveValue('matching phrase')
  await expect(matchCount).toHaveText('1 of 1')

  await page.reload()
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  await expect(findInput).toBeVisible()
  await expect(findInput).toHaveValue('matching phrase')
  await expect(matchCount).toHaveText('1 of 1')
})
