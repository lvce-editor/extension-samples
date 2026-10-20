import type { Page, TestInfo } from '@playwright/test'

export const captureOrganizeImportsDiagnostics = async (page: Page, testInfo: TestInfo): Promise<() => Promise<void>> => {
  const entries: string[] = []
  page.on('console', (message) => {
    if (message.text().includes('[DEBUG-ORGANIZE]')) entries.push(message.text())
  })
  await page.route('**/rendererWorkerMain.js*', async (route) => {
    const response = await route.fetch()
    let body = await response.text()
    body = body.replace(
      'const keyBinding = getKeyBinding(identifier);',
      'const keyBinding = getKeyBinding(identifier); console.log("[DEBUG-ORGANIZE] binding", identifier, JSON.stringify(keyBinding));',
    )
    body = body.replace(
      'setFocus = (focusKey, additionalFocusKey, uid, viewletModuleId) => {',
      'setFocus = (focusKey, additionalFocusKey, uid, viewletModuleId) => { console.log("[DEBUG-ORGANIZE] focus", focusKey, uid);',
    )
    entries.push(`[DEBUG-ORGANIZE] injected ${new URL(route.request().url()).pathname}`)
    await route.fulfill({ response, body })
  })
  await page.route('**/editorWorkerMain.js*', async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replace(
      'const undo = state => {',
      'const undo = state => { console.log("[DEBUG-ORGANIZE] undo", state.uid, state.undoStack.length, JSON.stringify(state.lines));',
    )
    entries.push(`[DEBUG-ORGANIZE] injected ${new URL(route.request().url()).pathname}`)
    await route.fulfill({ response, body })
  })
  await page.addInitScript(() => {
    document.addEventListener(
      'keydown',
      (event) => {
        console.log('[DEBUG-ORGANIZE] key', event.key, event.code, event.metaKey, event.ctrlKey, document.activeElement?.outerHTML)
      },
      true,
    )
  })
  return async () => {
    console.log('[DEBUG-ORGANIZE] captured', JSON.stringify(entries))
    await testInfo.attach('organize-command-diagnostics', { body: JSON.stringify(entries, null, 2), contentType: 'application/json' })
  }
}
