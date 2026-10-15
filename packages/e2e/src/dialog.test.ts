import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('warning dialog shows its content and supports confirming, reopening, and closing', async ({ page }) => {
  await page.goto('/extension-samples/dialog/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const dialog = page.locator('#preview-ide').getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.DialogHeading')).toHaveText('Example Warning')
  await expect(dialog.locator('.DialogMessage')).toHaveText('This is a sample warning dialog. No files have been changed.')
  await expect(dialog.locator('.DialogWarningIcon.MaskIconWarning')).toBeVisible()
  await expect(page.locator('#source-ide').getByRole('dialog')).toHaveCount(0)
  await expect
    .poll(() =>
      page.locator('#preview-ide').evaluate((element) => {
        const parent = element.getBoundingClientRect()
        const popup = element.querySelector('[role=dialog]')!.getBoundingClientRect()
        return popup.left >= parent.left && popup.right <= parent.right && popup.top >= parent.top && popup.bottom <= parent.bottom
      }),
    )
    .toBe(true)
  await dialog.getByRole('button', { exact: true, name: 'OK' }).click()
  await expect(dialog).toBeHidden()
  await runCommand(page, 'Sample: Show Warning Dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('.DialogClose').click()
  await expect(dialog).toBeHidden()
  const source = page.locator('#source-ide')
  await source.getByRole('treeitem', { exact: true, name: 'src' }).click()
  await source.getByRole('treeitem', { exact: true, name: 'main.ts' }).click()
  const editor = source.locator('.Editor')
  await editor.locator('textarea').focus()
  await page.keyboard.press('Control+End')
  await page.keyboard.insertText('\n// Saved source change')
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2', { timeout: 30_000 })
  await expect(dialog).toBeHidden()
  await expect(editor.locator('textarea')).toBeFocused()
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(dialog).toBeVisible()
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(dialog).toBeVisible()
})

test('information dialog shows its content and supports confirming and reopening in the preview', async ({ page }) => {
  await page.goto('/extension-samples/info-dialog/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const dialog = page.locator('#preview-ide').getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.DialogHeading')).toHaveText('Example Information')
  await expect(dialog.locator('.DialogMessage')).toHaveText('This is a sample information dialog. No files have been changed.')
  await expect(dialog.locator('.DialogInfoIcon.MaskIconInfo')).toBeVisible()
  await expect(page.locator('#source-ide').getByRole('dialog')).toHaveCount(0)
  await expect
    .poll(() =>
      page.locator('#preview-ide').evaluate((element) => {
        const parent = element.getBoundingClientRect()
        const popup = element.querySelector('[role=dialog]')!.getBoundingClientRect()
        return popup.left >= parent.left && popup.right <= parent.right && popup.top >= parent.top && popup.bottom <= parent.bottom
      }),
    )
    .toBe(true)
  await dialog.getByRole('button', { exact: true, name: 'OK' }).click()
  await expect(dialog).toBeHidden()
  await runCommand(page, 'Sample: Show Information Dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('.DialogClose').click()
  await expect(dialog).toBeHidden()
})

test('error dialog shows its content and supports confirming and reopening in the preview', async ({ page }) => {
  await page.goto('/extension-samples/error-dialog/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const dialog = page.locator('#preview-ide').getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.DialogHeading')).toHaveText('Example Error')
  await expect(dialog.locator('.DialogMessage')).toHaveText('This is a sample error dialog. No files have been changed.')
  await expect(dialog.locator('.DialogErrorIcon.MaskIconError')).toBeVisible()
  await expect(page.locator('#source-ide').getByRole('dialog')).toHaveCount(0)
  await expect
    .poll(() =>
      page.locator('#preview-ide').evaluate((element) => {
        const parent = element.getBoundingClientRect()
        const popup = element.querySelector('[role=dialog]')!.getBoundingClientRect()
        return popup.left >= parent.left && popup.right <= parent.right && popup.top >= parent.top && popup.bottom <= parent.bottom
      }),
    )
    .toBe(true)
  await dialog.getByRole('button', { exact: true, name: 'OK' }).click()
  await expect(dialog).toBeHidden()
  await runCommand(page, 'Sample: Show Error Dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('.DialogClose').click()
  await expect(dialog).toBeHidden()
})
