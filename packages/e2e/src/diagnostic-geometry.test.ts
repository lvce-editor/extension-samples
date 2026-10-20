import { expect, test } from '@playwright/test'

const diagnosticGeometryMatchesText = (root: Element): boolean => {
  const getTodoRanges = (): DOMRect[] => {
    const rows = root.querySelectorAll('.EditorRow')
    const ranges: DOMRect[] = []
    for (const row of rows) {
      const walker = root.ownerDocument.createTreeWalker(row, NodeFilter.SHOW_TEXT)
      let textNode = walker.nextNode() as Text | null
      while (textNode) {
        const text = textNode.textContent || ''
        let matchIndex = text.indexOf('TODO')
        while (matchIndex !== -1) {
          const range = root.ownerDocument.createRange()
          range.setStart(textNode, matchIndex)
          range.setEnd(textNode, matchIndex + 'TODO'.length)
          ranges.push(range.getBoundingClientRect())
          matchIndex = text.indexOf('TODO', matchIndex + 'TODO'.length)
        }
        textNode = walker.nextNode() as Text | null
      }
    }
    return ranges
  }
  const diagnosticMatchesRange = (diagnostic: Element, ranges: readonly DOMRect[]): boolean => {
    const actual = diagnostic.getBoundingClientRect()
    for (const expected of ranges) {
      const sameRowAndStart = Math.abs(expected.top - actual.top) < 1 && Math.abs(expected.left - actual.left) < 2
      const sameBounds = Math.abs(actual.left - expected.left) <= 1 && Math.abs(actual.right - expected.right) <= 1
      if (sameRowAndStart && sameBounds) {
        return true
      }
    }
    return false
  }
  const diagnostics = root.querySelectorAll('.DiagnosticError')
  const ranges = getTodoRanges()
  if (ranges.length !== diagnostics.length) return false
  for (const diagnostic of diagnostics) {
    if (!diagnosticMatchesRange(diagnostic, ranges)) {
      return false
    }
  }
  return true
}

test('diagnostic underlines match the rendered TODO text', async ({ page }) => {
  await page.goto('/extension-samples/diagnostic-provider/')
  const editor = page.locator('#preview-ide .Editor')
  await expect(editor.locator('.DiagnosticError')).toHaveCount(2, { timeout: 30_000 })
  await page.locator('body').evaluate((body) => body.ownerDocument.fonts.ready)

  const expectDiagnosticGeometry = async (): Promise<void> => {
    await expect.poll(() => page.locator('#preview-ide').evaluate(diagnosticGeometryMatchesText)).toBe(true)
  }

  await expectDiagnosticGeometry()
  await editor.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('prefix color=TODO size=TODO TODO')
  await expect(editor.locator('.EditorRow').first()).toHaveText('prefix color=TODO size=TODO TODO')
  await expect(editor.locator('.DiagnosticError')).toHaveCount(3)
  await expect(page.locator('#preview-ide .Problems').getByText('Replace TODO with a setting value.', { exact: true })).toHaveCount(3)
  await expectDiagnosticGeometry()
  await page.setViewportSize({ height: 800, width: 1200 })
  await expectDiagnosticGeometry()
  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(editor.locator('.DiagnosticError')).toHaveCount(2)
  await expectDiagnosticGeometry()
  await editor.locator('textarea').focus()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('color=blue size=large')
  await expect(editor.locator('.EditorRow').first()).toHaveText('color=blue size=large')
  await expect(editor.locator('.DiagnosticError')).toHaveCount(0)
  await expect(page.locator('#preview-ide .Problems')).toBeVisible()
  await expect(page.locator('#preview-ide .Problems').getByText('Replace TODO with a setting value.', { exact: true })).toHaveCount(0)
})
