import { expect, test, type Locator, type Page } from '@playwright/test'
import { runSelectedCommand } from './RunSelectedCommand.ts'

const replaceText = async (page: Page, editor: Locator, text: string): Promise<void> => {
  const textarea = editor.locator('textarea')
  await textarea.focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(text)
}

test('brace completion sample inserts matching braces and preserves undo', async ({ page }) => {
  await page.goto('/extension-samples/brace-completion/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  await replaceText(page, editor, 'word')
  await editor.locator('textarea').focus()
  await page.keyboard.press('End')
  await runSelectedCommand(page, 'Sample: Complete Brace')
  await expect(editor.locator('.EditorRow').first()).toHaveText('word()')
  await editor.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+z')
  await expect(editor.locator('.EditorRow').first()).toHaveText('word')
})

test('closing tags sample completes a closing tag', async ({ page }) => {
  await page.goto('/extension-samples/closing-tags/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  await replaceText(page, editor, '<demo><')
  await runSelectedCommand(page, 'Sample: Complete Closing Tag')
  await expect(editor.locator('.EditorRow').first()).toHaveText('<demo></demo>')
})

test('comments sample toggles block comments', async ({ page }) => {
  await page.goto('/extension-samples/comments/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  await replaceText(page, editor, 'comment me')
  await page.keyboard.press('ControlOrMeta+a')
  await runSelectedCommand(page, 'Sample: Toggle Sample Comment')
  await expect(editor.locator('.EditorRow').first()).toContainText('/*')
  await expect(editor.locator('.EditorRow').first()).toContainText('*/')
  await runSelectedCommand(page, 'Sample: Toggle Sample Comment')
  await expect(editor.locator('.EditorRow').first()).toHaveText('comment me')
})

test('selection expansion sample selects and replaces the current line', async ({ page }) => {
  await page.goto('/extension-samples/selection-expansion/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  const textarea = editor.locator('textarea')
  await runSelectedCommand(page, 'Sample: Select Current Line')
  await expect(editor.locator('.EditorSelection')).toHaveCount(1)
  await textarea.focus()
  await page.keyboard.insertText('replacement')
  await expect(editor.locator('.EditorRow').first()).toHaveText('replacement')
})

test('tab completion sample expands the log snippet and places the cursor', async ({ page }) => {
  await page.goto('/extension-samples/tab-completion/')
  await expect(page.locator('#preview-status')).toHaveText('Preview ready', { timeout: 30_000 })
  const editor = page.locator('#preview-ide .Editor')
  await replaceText(page, editor, 'log')
  await runSelectedCommand(page, 'Sample: Expand Log Snippet')
  await expect(editor.locator('.EditorRow').first()).toHaveText('console.log()')
  await editor.locator('textarea').focus()
  await page.keyboard.insertText('42')
  await expect(editor.locator('.EditorRow').first()).toHaveText('console.log(42)')
})
