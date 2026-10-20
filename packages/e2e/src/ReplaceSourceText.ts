import { expect, type Page } from '@playwright/test'
import { focusEditor } from './FocusEditor.ts'

export const replaceSourceText = async (page: Page, replacement: string): Promise<void> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  const sourceState = async (): Promise<{ selections: readonly number[]; text: string }> =>
    page.evaluate(async (entry) => {
      const renderer = await import(entry)
      const [document, selections] = await Promise.all([
        renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getTextDocument'),
        renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getSelections'),
      ])
      return { selections, text: document.text }
    }, entry)
  await focusEditor(page, 'source')
  const { text } = await sourceState()
  const lines = text.split('\n')
  await page.keyboard.press('ControlOrMeta+a')
  await expect
    .poll(async () => {
      const { selections } = await sourceState()
      return selections
    })
    .toEqual([0, 0, lines.length - 1, lines.at(-1)!.length])
  await page.keyboard.insertText(replacement)
  await expect
    .poll(async () => {
      const { text } = await sourceState()
      return text
    })
    .toBe(replacement)
}
