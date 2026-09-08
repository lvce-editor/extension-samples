import { expect, test } from '@playwright/test'

for (const sample of ['source-control-provider', 'file-system-provider']) {
  test(`resizes the ${sample} preview without closing either sidebar`, async ({ page }) => {
    await page.goto(`/extension-samples/${sample}/`)
    await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
    const preview = page.locator('#preview-ide')
    const source = page.locator('#source-ide')
    const originalPreview = (await preview.boundingBox())!
    const originalSource = (await source.boundingBox())!
    // The old layout exposed the preview's sidebar sash at this middle boundary.
    const x = Math.ceil((originalSource.x + originalSource.width + originalPreview.x) / 2)
    const y = originalPreview.y + 100
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 100, y, { steps: 10 })
    await page.mouse.up()
    await expect.poll(async () => (await preview.boundingBox())!.width).toBeLessThan(originalPreview.width - 90)
    await expect(preview.locator('.SideBar')).toBeVisible()
    await expect(source.locator('.SideBar')).toBeVisible()
    await expect(preview.locator('.Editor')).toHaveCount(1)

    const divider = page.getByRole('separator', { name: 'Resize source and preview' })
    await divider.focus()
    await page.keyboard.press('ArrowLeft')
    await expect.poll(async () => (await preview.boundingBox())!.width).toBeGreaterThan(originalPreview.width - 90)
    await divider.dblclick()
    await expect.poll(async () => Math.abs((await preview.boundingBox())!.width - originalPreview.width)).toBeLessThan(2)
    await expect(preview.locator('.SideBar')).toBeVisible()

    await divider.focus()
    await page.keyboard.press('Home')
    await expect(divider).toHaveJSProperty('ariaValueNow', '20')
    await page.keyboard.press('ArrowLeft')
    await expect(divider).toHaveJSProperty('ariaValueNow', '20')
    await page.keyboard.press('End')
    await expect(divider).toHaveJSProperty('ariaValueNow', '80')
    await page.keyboard.press('ArrowRight')
    await expect(divider).toHaveJSProperty('ariaValueNow', '80')
    await expect(preview.locator('.SideBar')).toBeVisible()
    await expect(source.locator('.SideBar')).toBeVisible()

    for (const root of [source, preview]) {
      const sidebar = (await root.locator('.SideBar').boundingBox())!
      const sash = (await root.locator('.SashSideBar').boundingBox())!
      expect(Math.abs(sash.x - sidebar.x - sidebar.width)).toBeLessThan(3)
    }
  })
}
