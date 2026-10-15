import { expect, test } from '@playwright/test'

test('anchors Explorer menus to the owning embedded IDE after resizing and page offsets', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  const menu = page.getByRole('menu')
  const assertPosition = async (id: string): Promise<void> => {
    const root = page.locator(`#${id}-ide`)
    const target = root.getByRole('treeitem', { exact: true, name: 'README.md' })
    const targetBox = (await target.boundingBox())!
    const x = targetBox.x + 60
    const y = targetBox.y + targetBox.height / 2
    await target.click({ button: 'right', position: { x: 60, y: targetBox.height / 2 } })
    await expect(menu).toBeVisible()
    const box = (await menu.boundingBox())!
    expect(Math.abs(box.x - x)).toBeLessThan(2)
    expect(Math.abs(box.y - y)).toBeLessThan(2)
    await expect.poll(() => menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
  }

  await assertPosition('source')
  await assertPosition('preview')
  const preview = page.locator('#preview-ide')
  const original = (await preview.boundingBox())!
  const divider = page.getByRole('separator', { name: 'Resize source and preview' })
  await divider.focus()
  for (let index = 0; index < 5; index++) await page.keyboard.press('ArrowRight')
  await expect.poll(async () => (await preview.boundingBox())!.width).toBeLessThan(original.width - 100)
  await assertPosition('preview')
  await assertPosition('source')

  await page.addStyleTag({ content: '.Toolbar { margin-top: 40px } .Playground { padding: 20px 30px; grid-template-rows: 88px minmax(0, 1fr) }' })
  await assertPosition('source')
  await assertPosition('preview')

  const root = (await preview.boundingBox())!
  const tree = preview.getByRole('tree', { name: 'Files Explorer' })
  const treeBox = (await tree.boundingBox())!
  await page.mouse.click(treeBox.x + 80, root.y + root.height - 5, { button: 'right' })
  await expect(menu).toBeVisible()
  const edgeBox = (await menu.boundingBox())!
  expect(edgeBox.x).toBeGreaterThanOrEqual(root.x)
  expect(edgeBox.y).toBeGreaterThanOrEqual(root.y)
  expect(edgeBox.y + edgeBox.height).toBeLessThanOrEqual(root.y + root.height + 2)
  await page.keyboard.press('Escape')

  await divider.focus()
  await page.keyboard.press('End')
  await expect.poll(async () => (await preview.boundingBox())!.width).toBeLessThan(320)
  const narrowRoot = (await preview.boundingBox())!
  const target = preview.getByRole('treeitem', { exact: true, name: 'README.md' })
  await target.click({ button: 'right', position: { x: 60, y: 11 } })
  await expect(menu).toBeVisible()
  const rightEdgeBox = (await menu.boundingBox())!
  expect(rightEdgeBox.x).toBeGreaterThanOrEqual(narrowRoot.x)
  expect(rightEdgeBox.x + rightEdgeBox.width).toBeLessThanOrEqual(narrowRoot.x + narrowRoot.width + 2)
  await expect.poll(() => menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)

  await tree.focus()
  await expect(tree).toBeFocused()
  await page.keyboard.press('Shift+F10')
  await expect(menu).toBeVisible()
  const keyboardBox = (await menu.boundingBox())!
  expect(keyboardBox.x).toBeGreaterThanOrEqual(narrowRoot.x)
  expect(keyboardBox.y).toBeGreaterThanOrEqual(narrowRoot.y)
  await expect.poll(() => menu.evaluate((element) => element.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)

  // The same command must change only the IDE that opened the menu.
  for (const id of ['source', 'preview']) {
    const owner = page.locator(`#${id}-ide`)
    const other = page.locator(`#${id === 'source' ? 'preview' : 'source'}-ide`)
    const tree = owner.getByRole('tree', { name: 'Files Explorer' })
    const treeBox = (await tree.boundingBox())!
    await tree.click({ button: 'right', position: { x: 80, y: treeBox.height - 5 } })
    await menu.getByRole('menuitem', { exact: true, name: 'New File...' }).click()
    await expect(owner.locator('.Explorer input')).toBeVisible()
    await expect(other.locator('.Explorer input')).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
})
