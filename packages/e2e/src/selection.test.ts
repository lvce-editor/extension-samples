import { expect, test, type Page } from '@playwright/test'

const sourceSelections = async (page: Page): Promise<readonly number[]> => {
  const response = await page.request.get('/extension-samples/runtime.json')
  const { entry } = await response.json()
  return page.evaluate(async (entry) => {
    const renderer = await import(entry)
    return renderer.executeCommand('Application.execute', 'source', 'GetActiveEditor.getSelections')
  }, entry)
}

test('double-click selection matches rendered source text', async ({ page }) => {
  await page.goto('/extension-samples/source-control-provider/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const assertSelectionGeometry = async (expectedFontSize: string): Promise<void> => {
    const editor = page.locator('#source-ide .Editor')
    const token = editor.locator('.EditorRow').nth(5).locator('.Token.VariableName')
    await expect(token).toHaveCSS('font-size', expectedFontSize)
    await token.dblclick()
    await expect.poll(() => sourceSelections(page)).toEqual([5, 6, 5, 19])

    await page.evaluate(() => globalThis.document.fonts.ready)
    const geometry = await page.locator('#source-ide').evaluate((root) => {
      const row = root.querySelectorAll('.EditorRow')[5]
      const token = [...row.querySelectorAll('.Token.VariableName')].find((element) => element.textContent?.trim() === 'workspaceRoot')!
      const selection = root.querySelector('.EditorSelection')!
      const range = root.ownerDocument.createRange()
      range.setStart(token.firstChild!, 0)
      range.setEnd(token.firstChild!, 'workspaceRoot'.length)
      const text = range.getBoundingClientRect()
      const highlight = selection.getBoundingClientRect()
      const line = row.getBoundingClientRect()
      return {
        highlight: { bottom: highlight.bottom, left: highlight.left, right: highlight.right, top: highlight.top },
        line: { bottom: line.bottom, top: line.top },
        token: { left: text.left, right: text.right },
      }
    })

    expect(Math.abs(geometry.highlight.left - geometry.token.left)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(geometry.highlight.right - geometry.token.right)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(geometry.highlight.top - geometry.line.top)).toBeLessThanOrEqual(1.5)
    expect(Math.abs(geometry.highlight.bottom - geometry.line.bottom)).toBeLessThanOrEqual(1.5)
  }

  await assertSelectionGeometry('15px')
  await page.evaluate(() => {
    const settings = JSON.parse(globalThis.localStorage.getItem('settings') || '{}')
    delete settings['editor.fontSize']
    globalThis.localStorage.setItem('settings', JSON.stringify(settings))
  })
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await assertSelectionGeometry('15px')

  await page.evaluate(() => {
    const settings = JSON.parse(globalThis.localStorage.getItem('settings') || '{}')
    settings['editor.fontSize'] = 13
    globalThis.localStorage.setItem('settings', JSON.stringify(settings))
  })
  await page.reload()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await assertSelectionGeometry('13px')
})
