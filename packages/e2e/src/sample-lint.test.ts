import { expect, test } from '@playwright/test'

for (const sample of ['file-system-provider', 'source-control-provider']) {
  for (const [rule, code] of [
    ['no-unsafe-return', 'export const unsafe = (): string => JSON.parse(\'"value"\')'],
    ['no-floating-promises', "Promise.resolve('lint test')"],
    ['unicorn/no-for-each', '[1].forEach(value => value)'],
  ]) {
    test(`${sample} reports ${rule} and clears it after undo`, async ({ page }) => {
      await page.goto(`/extension-samples/${sample}/`)
      await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
      const sourceEditor = page.locator('#source-ide .Editor')
      const diagnostics = sourceEditor.locator('.LayerDiagnostics .DiagnosticError')
      await expect(diagnostics).toHaveCount(0)
      await sourceEditor.locator('textarea').focus()
      await page.keyboard.press('Control+End')
      await page.keyboard.insertText(`\n${code}\n`)
      await expect(diagnostics).toHaveCount(1, { timeout: 20_000 })
      await expect(page.locator('#preview-ide .DiagnosticError')).toHaveCount(0)
      await page.keyboard.press('Control+z')
      await expect(diagnostics).toHaveCount(0)
    })
  }
}
