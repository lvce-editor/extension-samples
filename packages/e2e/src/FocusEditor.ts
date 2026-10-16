import { expect, type Page } from '@playwright/test'

export const focusEditor = async (page: Page, rootId = 'preview'): Promise<void> => {
  const input = page.locator(`#${rootId}-ide .Editor textarea`)
  await input.focus()
  // DOM focus precedes the worker publishing the editor's active keybindings.
  // Await the same focus command before sending shortcuts to the embedded editor.
  await page.evaluate(async (id) => {
    const prefix = globalThis.document.body.dataset.routePrefix
    const response = await globalThis.fetch(`${prefix}/runtime.json`)
    const { entry } = await response.json()
    const renderer = await import(entry)
    const editor = globalThis.document.querySelector<HTMLElement>(`#${id}-ide .Editor`)!
    await renderer.executeCommand('Viewlet.executeViewletCommand', Number(editor.dataset.uid), 'handleFocus')
  }, rootId)
  await expect(input).toBeFocused()
}
