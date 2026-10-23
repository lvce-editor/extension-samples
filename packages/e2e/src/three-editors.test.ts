import { expect, test } from '@playwright/test'
import { runCommand } from './RunCommand.ts'

test('opens three sample files side by side and reuses the columns on repeat', async ({ page }) => {
  await page.goto('/extension-samples/three-editors/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const groups = page.locator('#preview-ide .EditorGroup')
  const htmlGroup = groups.nth(0)
  const cssGroup = groups.nth(1)
  const jsGroup = groups.nth(2)
  await runCommand(page, 'Sample: Open Three Editors')
  await expect(groups).toHaveCount(3)
  await expect(htmlGroup).toContainText('index.html')
  await expect(cssGroup).toContainText('styles.css')
  await expect(jsGroup).toContainText('main.js')
  const boxes = await Promise.all([htmlGroup, cssGroup, jsGroup].map((group) => group.boundingBox()))
  const positions = boxes.map((box) => {
    expect(box).not.toBeNull()
    if (!box) {
      throw new Error('Expected each editor group to have visible dimensions')
    }
    expect(box.width).toBeGreaterThanOrEqual(150)
    expect(box.height).toBeGreaterThanOrEqual(150)
    return box.x
  })
  expect(positions[0]).toBeLessThan(positions[1])
  expect(positions[1]).toBeLessThan(positions[2])

  const tabsBeforeRepeat = await Promise.all([htmlGroup, cssGroup, jsGroup].map((group) => group.getByRole('tab').allTextContents()))
  await runCommand(page, 'Sample: Open Three Editors')
  await expect(groups).toHaveCount(3)
  const jsTab = jsGroup.getByRole('tab')
  const tabsAfterRepeat = await Promise.all([htmlGroup, cssGroup, jsGroup].map((group) => group.getByRole('tab').allTextContents()))
  expect(tabsAfterRepeat).toEqual(tabsBeforeRepeat)
  await expect(jsTab).toHaveAttribute('aria-selected', 'true')
})
