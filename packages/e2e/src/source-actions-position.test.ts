import { expect, test } from '@playwright/test'

test('positions empty source actions next to the cursor in the embedded editor', async ({ page }) => {
  await page.goto('/extension-samples/hello-world/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })

  const assertSourceActionsPosition = async (rootId: string, clickEditor = true): Promise<void> => {
    const root = page.locator(`#${rootId}-ide`)
    const editor = root.locator('.Editor')
    if (clickEditor) await editor.locator('.EditorRow').first().click()
    await editor.locator('textarea').focus()
    await page.keyboard.press('Control+.')

    const message = root.locator('.EditorMessageText')
    await expect(message).toHaveText('No code actions available')
    const popupBox = await root.locator('.EditorMessage').boundingBox()
    const cursorBox = await editor.locator('.EditorCursor').boundingBox()
    expect(cursorBox).not.toBeNull()
    expect(popupBox).not.toBeNull()
    expect(Math.abs(popupBox!.x - cursorBox!.x)).toBeLessThan(6)
    expect(Math.abs(popupBox!.y - (cursorBox!.y + cursorBox!.height))).toBeLessThan(2)
    await page.keyboard.press('Escape')
  }

  await assertSourceActionsPosition('source')
  await assertSourceActionsPosition('preview')

  const preview = page.locator('#preview-ide')
  const originalPreview = (await preview.boundingBox())!
  const source = page.locator('#source-ide')
  const originalSource = (await source.boundingBox())!
  const x = Math.ceil((originalSource.x + originalSource.width + originalPreview.x) / 2)
  const y = originalPreview.y + 100
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 100, y, { steps: 10 })
  await page.mouse.up()
  await expect.poll(async () => (await preview.boundingBox())!.width).toBeLessThan(originalPreview.width - 90)
  await assertSourceActionsPosition('preview')

  await page.addStyleTag({
    content: '.Playground { grid-template-rows: 0 minmax(0, 1fr) } .Toolbar, .IdePane > header { display: none } .IdePane { grid-template-rows: 0 minmax(0, 1fr) }',
  })
  await expect.poll(async () => (await source.boundingBox())!.y).toBe(0)
  await assertSourceActionsPosition('source', false)
})
