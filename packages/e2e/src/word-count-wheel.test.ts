import { expect, test, type Page } from '@playwright/test'

interface WheelRegistration {
  readonly passive: boolean
  readonly targetClass: string
  readonly targetId: number
}

type GlobalWithWheelRegistrations = typeof globalThis & {
  __extensionSamplesWheelRegistrations?: WheelRegistration[]
}

const expectPassiveWheelListeners = async (page: Page): Promise<void> => {
  const registrations = await page.evaluate(() => (globalThis as GlobalWithWheelRegistrations).__extensionSamplesWheelRegistrations || [])
  const editorListeners = registrations.filter((registration) => registration.targetClass === 'EditorContent')
  expect(new Set(editorListeners.map((registration) => registration.targetId)).size).toBeGreaterThanOrEqual(2)
  expect(editorListeners.every((registration) => registration.passive)).toBe(true)
}

const expectBothEditorsToScroll = async (page: Page): Promise<void> => {
  await page.setViewportSize({ height: 150, width: 1600 })
  for (const id of ['source-ide', 'preview-ide']) {
    const editor = page.locator(`#${id}`)
    const content = editor.locator('.EditorContent')
    const visibleLines = editor.locator('.GutterRows')
    await content.hover()
    await page.mouse.wheel(0, -1000)
    const before = await visibleLines.locator('.LineNumber').allTextContents()
    await page.mouse.wheel(0, 300)
    await expect.poll(() => visibleLines.locator('.LineNumber').allTextContents()).not.toEqual(before)
  }
  await page.setViewportSize({ height: 900, width: 1600 })
}

test('word count editors keep passive wheel listeners and scroll after rebuild and reset', async ({ page }) => {
  const wheelViolations: string[] = []
  page.on('console', (message) => {
    const text = message.text()
    if (
      text.includes("Added non-passive event listener to a scroll-blocking 'wheel' event") ||
      text.includes('Unable to preventDefault inside passive event listener')
    ) {
      wheelViolations.push(text)
    }
  })
  await page.addInitScript(() => {
    const global = globalThis as GlobalWithWheelRegistrations
    global.__extensionSamplesWheelRegistrations = []
    const targetIds = new WeakMap<EventTarget, number>()
    let nextTargetId = 1
    const original = EventTarget.prototype.addEventListener
    /* eslint-disable unicorn/no-this-outside-of-class */
    EventTarget.prototype.addEventListener = function (type, listener, options): void {
      if (type === 'wheel' && this instanceof Element && this.className === 'EditorContent') {
        let targetId = targetIds.get(this)
        if (!targetId) {
          targetId = nextTargetId++
          targetIds.set(this, targetId)
        }
        global.__extensionSamplesWheelRegistrations?.push({
          passive: typeof options === 'object' && options?.passive === true,
          targetClass: this.className,
          targetId,
        })
      }
      return original.call(this, type, listener, options)
    }
    /* eslint-enable unicorn/no-this-outside-of-class */
  })

  await page.goto('/extension-samples/word-count/')
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expectPassiveWheelListeners(page)
  await expectBothEditorsToScroll(page)

  const source = page.locator('#source-ide')
  const filesResponse = await page.request.get('/extension-samples/samples/word-count/files.json')
  const files = await filesResponse.json()
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(`${files['/src/main.ts']}\n// Rebuild the sample.\n`)
  await page.keyboard.press('Control+s')
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '2')
  await expectPassiveWheelListeners(page)
  await source.locator('.Editor textarea').focus()
  await page.keyboard.press('Control+End')
  for (let index = 0; index < 25; index++) {
    await page.keyboard.press('Enter')
  }
  await expectBothEditorsToScroll(page)

  await page.getByRole('button', { name: 'Reset sample' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-playground-ready', 'true', { timeout: 30_000 })
  await expect(page.locator('body')).toHaveAttribute('data-preview-revision', '1')
  await expectPassiveWheelListeners(page)
  await expectBothEditorsToScroll(page)
  expect(wheelViolations).toEqual([])
})
